const express = require("express");
const router = express.Router();
const RoleController = require("../controllers/RoleController");
const { asyncHandle } = require("../utils/asyncHandle");
const authMiddleware = require("../middlewares/authMiddleware");
router.get("/",authMiddleware, asyncHandle(RoleController.getAllRoles));

module.exports = router;