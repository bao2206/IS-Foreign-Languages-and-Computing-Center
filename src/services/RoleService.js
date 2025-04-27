const RoleModel = require('../models/RoleModel');
class RoleService {
    async findRole(role) {
        return await RoleModel.findOne({name: role});
    }
    async updatePerrmissionDelete(id){
        return await RoleModel.updateMany(
            { permissions: id },
            { $pull: { permissions: id } }
        );
    }
}

module.exports = new RoleService();