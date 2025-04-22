const userModel = require('../models/UserModel');
const authModel = require('../models/AuthModel');

class UserService {
  async checkEmail(email) {
    return await userModel.findOne({ email });
  }
   async createNewStaff(name, sex, email, citizenID, phone, address, avatar) {
    return await userModel.create({
      name, sex, email, citizenID, phone, address, avatar
    }) 
  }
  // async findAuthById(userID){
  //   return await userModel.findById(userID).select('authId');
  // }

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
      status,
      address
    } = data;

    Object.assign(user, {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(citizenID !== undefined && { citizenID }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
      ...(status !== undefined && { status }),
    });

    if (address !== undefined) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    return await user.save();
  }
}


module.exports = new UserService();
