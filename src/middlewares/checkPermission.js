const { NotAcceptableError } = require("../core/errorCustom");
// const {rolePermissions} = require('../middleware/permissions')
const AuthModel = require("../models/AuthModel");

const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const user = await AuthModel.findById(req.user._id)
        .populate({
          path: "role",
          populate: { path: "permissions" },
        })
        .populate("customPermission");

      // console.log("User: ", user);
      // Danh sách quyền từ role và từ user.customPermissions
      const rolePermissions = user.role?.permissions || [];
      const customPermission = user.customPermission || [];

      const allPermissions = [
        ...new Set([
          ...rolePermissions.map((p) => p.key),
          ...customPermission.map((p) => p.key),
        ]),
      ];

      if (!allPermissions.includes(permissionName)) {
        // console.log("Available permissions:", allPermissions);
        // console.log("Missing permission:", permissionName);
        throw new NotAcceptableError(`Permission denied`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
module.exports = checkPermission;
