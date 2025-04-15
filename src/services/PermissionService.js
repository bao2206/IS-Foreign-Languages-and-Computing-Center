const PermissionModel = require('../models/PermissionModel');

class PermissionService {
    async getAllPermission() {
        return await PermissionModel.find();
    }
    async createPermission(key, description) {
        return await PermissionModel.create({ key, description });
      
    }
    async findPermisionByKey(key){
        return await PermissionModel.findOne({key});
    }
}
module.exports = new PermissionService();