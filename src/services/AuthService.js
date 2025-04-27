const AuthModel = require('../models/AuthModel');

class AuthService {
    async findRole(role){
        return await AuthModel.find(role).select("_id");
    }
    async createAccount(username, password, role) {
        return await AuthModel.create({username, password, role});
    }
    async findAccount(id){
        return await AuthModel.findById(id);
    }
    async findByUsername(username){
        return await AuthModel.findOne({username});
    }
    async findByResetToken(token){
        return await AuthModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires : { $gt: Date.now() }
        }, {new: true});
    }
}

module.exports = new AuthService();