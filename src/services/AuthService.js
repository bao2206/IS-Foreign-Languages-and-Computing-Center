const AuthModel = require('../models/AuthModel');

class AuthService {
    async createAccount(username, password, role) {
        return await AuthModel.create({username, password, role});
    }
}

module.exports = new AuthService();