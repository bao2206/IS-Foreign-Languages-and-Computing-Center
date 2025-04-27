const PermissionModel = require('../models/PermissionModel');

class PermissionService {
    async getAllPermission() {
        return await PermissionModel.find();
    }
    async findId(id) {
        return await PermissionModel.findById(id);
    }
    async createPermission(key, description) {
        return await PermissionModel.create({ key, description });
      
    }
    async findPermisionByKey(key){
        return await PermissionModel.findOne({key});
    }
    async updatePermission(id, data){
        return await PermissionModel.findByIdAndUpdate(
            id, data, {new: true});
    }
    async deletePermission(id) {
        return await PermissionModel.findByIdAndDelete(id);
    }
}
module.exports = new PermissionService();