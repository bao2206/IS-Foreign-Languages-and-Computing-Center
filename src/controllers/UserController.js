const {createUserService, findUserByID} = require('../services/userService');
const {sendEmailService} = require('../services/emailService');
const Auth = require('../models/AuthModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const userModel = require('../models/userModel');


const createUser = async (req, res) => {
    const data = req.body;
    const user = await createUserService(data);
    if (!user) {
        return res.status(400).json({
            message: "User creation failed",
        });
    }
    else(
        sendEmailService(user.email, user._id, user.name)
    )
    return res.status(201).json({
        message: "User created successfully",
        data: user,
    });
}

const getUsertoCreateAccount = async (req, res) => {
    try {
        console.log("getus: ", req.user.userID);
        
        const userID = req.user.userID;

        
        const user = await findUserByID(userID);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const checkUser= await Auth.findById(user.authId);
        if (checkUser && checkUser.username) {
            return res.status(200).json({
                message: "User already has a username, no need to register again.",
            });
        }
        res.render('registerAccount.ejs', {
            user: user,
        });

    } catch (error) {
        console.log(error);
    }
}

const registerAccount = async (req, res) => {
    try {
        const { username, password} = req.body;

        const userID = req.params.id;
        console.log("userID: ", userID);
        // Kiểm tra đủ dữ liệu đầu vào
        if (!userID || !username || !password) {
            throw new Error("Missing required fields", 400);
        }

        // Tìm user theo userID
        const user = await userModel.findById(userID);
        const auth = await Auth.findById(user.authId);

        if (!user) {
            throw  new Error("User not found", 404);
        }

        // Kiểm tra username đã tồn tại chưa (tránh trùng username với user khác)
        const existingUser = await Auth.findOne({ username });
        if (existingUser && existingUser._id.toString() !== auth._id.toString()) {
            throw  new Error("Username already exists", 400);
        }

        // Cập nhật username và password (hash password trước khi lưu)
        auth.username = username;
        auth.password = password;

        await auth.save();

        res.status(200).json({
            message: "Account updated successfully",
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
            success: true, // Để hiển thị thông báo trên web
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
        });
    }
}

module.exports = {
    createUser,
    getUsertoCreateAccount,
    registerAccount
}