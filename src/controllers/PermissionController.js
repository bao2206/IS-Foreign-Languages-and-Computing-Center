const PermissionService =  require("../services/PermissionService")
const RoleService = require("../services/RoleService")
const slugify = require('slugify');
const {ErrorCustom, NotFoundError} = require("../core/errorCustom");
class PermissionController {
    async getAllPermission(req, res) {
        const permissions = await PermissionService.getAllPermission();
        return res.status(200).json({
            status: "success",
            data: {
                permissions
            }
        });
        // res.send("Permission route is working!");
    }
    async createPermission(req, res) {
        const {key, description} = req.body;
        if(!key) throw new ErrorCustom("Key is required", 431);
        if(!description) throw new ErrorCustom("Description is required", 431);
        const exits = await PermissionService.findPermisionByKey(key);
        if(exits) throw new ErrorCustom("Permission already exists", 431);
        const permission = await PermissionService.createPermission(key, description);
        const adminRole = await RoleService.findRole("admin");
        if (adminRole && !adminRole.permissions.includes(permission._id)) {
          adminRole.permissions.push(permission._id);
          await adminRole.save();
        }
        return res.status(201).json({
            message: "success",
            data: {
                permission
            }
        });
    }
    async deletePermission(req, res) {
        const {id} = req.params;
        const idPermission = await PermissionService.findId(id);
        if(!idPermission) throw new NotFoundError("Id is required");
        const permission = await PermissionService.deletePermission(id);
        if(!permission) throw new ErrorCustom("Permission not found", 431);
        await RoleService.updatePerrmissionDelete(id);
        return res.status(200).json({
            message: "success",
            data: {
                permission
            }
        });
    }
    async updatePermission(req, res) {
        const {id} = req.params;
        const {key, description} = req.body;
        const idPermission = await PermissionService.findId(id);
        if(!idPermission) throw new NotFoundError("Id is required");

        let updatedData = {description};

        if(key){
            updatedData.key = key;
            updatedData.name = slugify(key, { lower: true, strict: true });
        }

        const updated = await PermissionService.updatePermission(idPermission, updatedData);
        res.status(200).json({
            message: "Updated success",
            data: {
                permission: updated
            }
        });
    }
}

module.exports = new PermissionController();