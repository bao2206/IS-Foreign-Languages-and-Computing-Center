const userModel = require('../models/userModel');
const authModel = require('../models/AuthModel');

const createUserService = async (data) => {
    try {
        const auth = await authModel.create({
            role: data.role,
        })
        const user = await userModel.create({
            name: data.name,
            authId: auth._id,
            email: data.email,
            citizenID: data.citizenID,
            phone: data.phone,
            address: {
                street: data.street||'',
                city: data.city||'',
                country: data.country||'',
            },
            avatar: data.avatar,
            status: data.status,
        });
        
        return user;
    } catch (error) {
        throw error;
    }
}

const findUserByID = async (userID) => {
    try {
        const user = await userModel.findById(userID);
        return user;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createUserService,
    findUserByID,
}