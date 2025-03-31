const {createUserService} = require('../services/userService');
const createUser = async (req, res) => {
    const data = req.body;
    const user = await createUserService(data);
    return res.status(201).json({
        message: "User created successfully",
        data: user,
    });
}

module.exports = {
    createUser
}