const RoleModel = require('../models/RoleModel');
class RoleService {
    async findRole(role) {
        return await RoleModel.findOne({name: role});
    }
}

module.exports = new RoleService();