const userModel = require("../models/UserModel");
const authModel = require("../models/AuthModel");
const roleModel = require("../models/RoleModel");
const { NotFoundError } = require("../core/errorCustom");

class UserService {
  async findItems(searchOptions = {}) {
    const {
      search = '',
      role,
      status,
      sex,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = searchOptions;

    // Build query
    const query = {};
    
    // Text search across multiple fields with case-insensitive matching
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { citizenID: searchRegex }
      ];
    }

    // Add filters only if they are defined and not empty
    if (status && status.trim() !== '') query.status = status;
    if (sex && sex.trim() !== '') query.sex = sex;

    // Role filter requires finding the role ID first
    if (role && role.trim() !== '') {
      const roleDoc = await roleModel.findOne({ name: role.toLowerCase() });
      if (roleDoc) {
        const auths = await authModel.find({ role: roleDoc._id }).select('_id');
        if (auths.length > 0) {
          const authIds = auths.map(auth => auth._id);
          query.authId = { $in: authIds };
        }
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and populate
    const users = await userModel
      .find(query)
      .populate({
        path: 'authId',
        select: 'username role',
        populate: {
          path: 'role',
          select: 'name'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await userModel.countDocuments(query);

    return {
      data: users,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getAllUsers(query, skip, parsedLimit) {
    return await userModel
      .find(query)
      .populate({
        path: "authId",
        select: "username role",
        populate: {
          path: "role",
          select: "name",
        },
      })
      .skip(skip)
      .limit(parsedLimit);
  }

  async checkEmail(email) {
    return await userModel.findOne({ email });
  }

  async findByAuthId(authId) {
    return await userModel.findOne({ authId });
  }

  async countUsers(query) {
    return await userModel.countDocuments(query);
  }

  async findById(userID) {
    const user = await userModel.findById(userID);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async findByUsername(username) {
    const user = await authModel.findOne({ username });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateUserById(userID, data) {
    const user = await userModel.findById(userID);
    if (!user) throw new NotFoundError("User not found");

    const {
      name,
      email,
      citizenID,
      phone,
      avatar,
      address,
    } = data;

    Object.assign(user, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(citizenID !== undefined && { citizenID }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
    });

    if (address !== undefined) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    return await user.save();
  }

  async createNewStaff(data) {
    return await userModel.create(data);
  }

  async findByIdOfAuth(authId) {
    return await userModel.findOne({ authId });
  }

  async addMultiplePermissions(authId, permissions) {
    return await authModel.findByIdAndUpdate(
      authId,
      { $addToSet: { customPermission: { $each: permissions } } },
      { new: true }
    );
  }

  async checkCustomPermission(userId, permissionId) {
    const user = await authModel.findById(userId);
    return user.customPermission.includes(permissionId);
  }

  async removeCustomPermission(authId, permissionId) {
    return await authModel.findByIdAndUpdate(
      authId,
      { $pull: { customPermission: permissionId } },
      { new: true }
    );
  }

  async updateUserRole(userId, role) {
    return await authModel.findByIdAndUpdate(
      userId,
      { role: role._id },
      { new: true }
    );
  }

  async getUsersAreStaff() {
    return await userModel.find().populate({
      path: "authId",
      select: "username role",
      populate: {
        path: "role",
        select: "name",
      },
    });
  }
}

module.exports = new UserService();
