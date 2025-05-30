const RoleService = require('../services/RoleService');

class RoleController {
    async getAllRoles(req, res) {
        const roles = await RoleService.getAllRoles();
        res.status(200).json(roles);
    }
}

module.exports = new RoleController();