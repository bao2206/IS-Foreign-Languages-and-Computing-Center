const userModel = require('../models/userModel');
const authModel = require('../models/AuthModel');

class UserService {
   async create(data) {
    try {
      const auth = await authModel.create({ role: data.role });

      const user = await userModel.create({
        name: data.name,
        authId: auth._id,
        email: data.email,
        citizenID: data.citizenID,
        phone: data.phone,
        address: {
          street: data.street || '',
          city: data.city || '',
          country: data.country || '',
        },
        avatar: data.avatar,
        status: data.status,
      });

      return user;
    } catch (error) {
      throw error;
    }
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
