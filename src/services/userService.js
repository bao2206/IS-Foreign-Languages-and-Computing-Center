const userModel = require("../models/UserModel");
const authModel = require("../models/AuthModel");

class UserService {
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
  async createNewStaff(name, sex, email, citizenID, phone, address, avatar) {
    return await userModel.create({
      name,
      sex,
      email,
      citizenID,
      phone,
      address,
      avatar,
    });
  }
  async findByAuthId(authId) {
    return await userModel.findOne({ authId });
  }
  async countUsers(query) {
    return await userModel.countDocuments(query);
  }
  async findById(userID) {
    try {
      return await userModel.findById(userID);
    } catch (error) {
      throw error;
    }
  }

  async findByUsername(username) {
    try {
      return await authModel.findOne({ username });
    } catch (error) {
      throw error;
    }
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
      // status,
      address,
    } = data;

    Object.assign(user, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(citizenID !== undefined && { citizenID }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
      // ...(status !== undefined && { status }),
    });

    if (address !== undefined) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    return await user.save();
  }
  async findByIdOfAuth(id){
    return await authModel.findById(id);
  }
  async updateDeleteCustomPermission(id) {
    return await authModel.updateMany(
      { customPermission: id },
      { $pull: { customPermission: id } }
    );
  }
  async addMultiplePermissions(userId, permissions) {
    return await authModel.findByIdAndUpdate(
      userId,
      { $addToSet: { customPermission: { $each: permissions } } },
      { new: true }
    );
  }
  async checkCustomPermission(userId, permissionId) {
    // console.log()
    return await userId.customPermission.some(
      (perm) => perm.toString() === permissionId
    );
  }
  async removeCustomPermission(userId, permissionId) {
    return await authModel.findByIdAndUpdate(
      userId,
      { $pull: { customPermission: {$in :permissionId} } },
      { new: true }
    );
  }


  async updateUserRole(userId, roleId) {
    return await authModel.findByIdAndUpdate(
      userId,
      { role: roleId },
      { new: true }
    ).populate('role');
  }
}

module.exports = new UserService();
