const {NotAcceptableError} = require('../core/errorCustom')
// const {rolePermissions} = require('../middleware/permissions')
const AuthModel = require("../models/AuthModel")


const checkPermission = (permissionName) => {
    return async (req, res, next) => {
      const user = await AuthModel.findById(req.user._id)
        .populate({
          path: "role",
          populate: { path: "permissions" }
        })
        .populate("customPermissions");
  
      // Danh sách quyền từ role và từ user.customPermissions
      const rolePermissions = user.role?.permissions || [];
      const customPermissions = user.customPermissions || [];
  
      const allPermissions = [
        ...new Set([
          ...rolePermissions.map(p => p.name),
          ...customPermissions.map(p => p.name),
        ])
      ];
  
      if (!allPermissions.includes(permissionName)) throw new NotAcceptableError("Permission denied");
  
      next();
    };
  };
module.exports = checkPermission