const Permission = require('../models/PermissionModel');
const Role = require('../models/RoleModel');

async function initAdminRole() {
  const existingAdmin = await Role.findOne({ name: "admin" });
  if (existingAdmin) return; // Đã có admin role thì thôi

  const allPermissions = await Permission.find();
  console.log("All:", allPermissions);
  const adminRole = new Role({
    name: "admin",
    permissions: allPermissions.map(p => p._id)
  });

  await adminRole.save();
  console.log("✅ Admin role đã được khởi tạo với toàn bộ quyền.");
}
module.exports = { initAdminRole };