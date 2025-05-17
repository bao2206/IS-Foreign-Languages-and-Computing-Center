const RoleModel = require('../models/RoleModel');
const { find } = require('../models/UserModel');
class RoleService {
    async getAllRoles() {
        return await RoleModel.find();
    }   
    async findRoleById(id){
        return await RoleModel.findById(id);
    }
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