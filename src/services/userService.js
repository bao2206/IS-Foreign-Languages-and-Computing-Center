const userModel = require("../models/UserModel");
const authModel = require("../models/AuthModel");
const roleModel = require("../models/RoleModel");

class UserService {
  async getAllUsers(query, skip, parsedLimit) {
    return await userModel
      .find(query)
      .populate({
        path: "authId",
        select: "role",
        populate: {
          path: "role",
          select: "name",
        },
      })
      .lean() // Chuyển thành plain object để xử lý
      .skip(skip)
      .limit(parsedLimit)
      .exec()
      .then((users) =>
        users.map((user) => ({
          ...user,
          role: user.authId?.role?.name || "N/A", // Thêm trường role
          authId: undefined, // Xóa authId
        }))
      );
  }
  async checkEmail(email) {
    return await userModel.findOne({ email });
  }
  async createNewStaff(data) {
    try {
      delete data.role;
      return await userModel.create(data);
    } catch (error) {
      console.log(error);

      throw error;
    }
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
  async findByIdOfAuth(id) {
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
      { $pull: { customPermission: { $in: permissionId } } },
      { new: true }
    );
  }

  async updateUserRole(userId, roleId) {
    return await authModel
      .findByIdAndUpdate(userId, { role: roleId }, { new: true })
      .populate("role");
  }

  async getUsersAreStaff() {
    return await userModel.aggregate([
      // Nối từ User → Auth
      {
        $lookup: {
          from: "auths", // collection name của Auth
          localField: "authId",
          foreignField: "_id",
          as: "auth",
        },
      },
      { $unwind: "$auth" },

      // Nối từ Auth → Role
      {
        $lookup: {
          from: "roles", // collection name của Role
          localField: "auth.role",
          foreignField: "_id",
          as: "role",
        },
      },
      { $unwind: "$role" },

      // Lọc các role cần thiết
      {
        $match: {
          "role.name": { $in: ["teacher", "staff", "consultant", "academic"] },
        },
      },

      // Dựng lại kết quả mong muốn
      {
        $project: {
          _id: 1,
          name: 1,
          sex: 1,
          email: 1,
          citizenID: 1,
          phone: 1,
          address: 1,
          avatar: 1,
          status: 1,
          createdAt: 1,
          role: "$role.name",
        },
      },
    ]);
  }
}

module.exports = new UserService();
