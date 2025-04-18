const PermissionService =  require("../services/PermissionService")
const RoleService = require("../services/RoleService")
const {ErrorCustom} = require("../core/errorCustom");
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
        console.log("Admin role:", adminRole);
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
}

module.exports = new PermissionController();