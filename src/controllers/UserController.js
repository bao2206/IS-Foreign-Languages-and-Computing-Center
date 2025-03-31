const {createUserService} = require('../services/userService');
const {sendEmailService} = require('../services/emailService');

const createUser = async (req, res) => {
    const data = req.body;
    const user = await createUserService(data);
    if (!user) {
        return res.status(400).json({
            message: "User creation failed",
        });
    }
    else(
        sendEmailService(user.email)
    )
    return res.status(201).json({
        message: "User created successfully",
        data: user,
    });
}

module.exports = {
    createUser
}