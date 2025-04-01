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
        const token = req.params.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userID = decoded.userID;
        const user = await findUserByID(userID);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        res.render('registerAccount.ejs', {
            user: user,
            token: token,
        });

    } catch (error) {
        console.log(error);
    }
}

const registerAccount = async (req, res) => {
    try {
        const { username, password } = req.body;
        const token = req.params.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userID = decoded.userID;
        console.log("Register account data:", req.body);
        console.log("Decoded token:", decoded);
        console.log("User ID:", userID);
        // Kiểm tra đủ dữ liệu đầu vào
        if (!userID || !username || !password || !token) {
            throw new Error("Missing required fields", 400);
        }

        // Tìm user theo userID
        const user = await userModel.findById(userID);
        const auth = await Auth.findById(user.authId);
        console.log("User found:", user);
        if (!user) {
            throw  new Error("User not found", 404);
        }

        console.log("User found:", user);

        // Kiểm tra username đã tồn tại chưa (tránh trùng username với user khác)
        const existingUser = await Auth.findOne({ username });
        if (existingUser && existingUser._id.toString() !== auth._id.toString()) {
            throw  new Error("Username already exists", 400);
        }

        console.log("Username is not available");

        // Cập nhật username và password (hash password trước khi lưu)
        auth.username = username;
        auth.password = await bcrypt.hash(password, parseInt(process.env.SALT_WORK_FACTOR, 10));

        await auth.save();

        console.log("User updated:", auth);
        // ✅ Vô hiệu hóa token bằng cách lưu vào danh sách token bị thu hồi (cần thiết nếu dùng JWT)
        revokeToken(token);

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