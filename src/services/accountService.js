const mongoose = require('mongoose');

const AuthModel = require('../models/AuthModel');
const {ErrorCustom} = require('../core/errorCustom');


class AccountService {
    FindUserByRoleAdmin = async({role}) => {
        return await AuthModel.findOne({role : "Admin"});
    }
}

module.exports = new AccountService();