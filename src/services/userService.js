const userModel = require('../models/userModel');

const createUserService = async (data) => {
    try {
        const user = await userModel.create({
            name: data.name,
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

module.exports = {
    createUserService,
}