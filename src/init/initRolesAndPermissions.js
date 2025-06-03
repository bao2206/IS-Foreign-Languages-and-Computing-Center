// init/initRolesAndPermissions.js
const mongoose = require("mongoose");
require("dotenv").config();

const Role = require("../models/RoleModel");
const Permission = require("../models/PermissionModel");
const permissionsData = require("../data/permissionData");

async function init() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🚀 Connected to MongoDB");

  // 1. Tạo permission nếu chưa có
  for (const perm of permissionsData) {
    const exists = await Permission.findOne({ key: perm.key });
    if (!exists) {
      await Permission.create(perm);
      console.log(`✅ Created permission: ${perm.key}`);
    }
  }

  const allPermissions = await Permission.find();

  const roles = ["student", "parent", "teacher", "admin", "consultant", "academic", "finance"];
  
  for (const roleName of roles) {
    const exists = await Role.findOne({ name: roleName });
    if (!exists) {
      const role = new Role({
        name: roleName,
        permissions: roleName === "admin" ? allPermissions.map(p => p._id) : []
      });
      await role.save();
      console.log(`🎉 Created role: ${roleName}`);
    }
  }

  await mongoose.disconnect();
  console.log("✅ Initialization complete.");
}

init().catch(err => {
  console.error(err);
  process.exit(1);
});