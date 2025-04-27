const UserService = require("../services/userService");
const {
  sendAccount,
  sendResetPasswordEmail,
} = require("../services/emailService");
const { generateUsername, generatePassword } = require("../utils/userUtils");
const Auth = require("../models/AuthModel");
const jwt = require("jsonwebtoken");
const redis = require("../utils/redis");
const RoleService = require("../services/RoleService");
const userModel = require("../models/UserModel");
const AuthService = require("../services/AuthService");
const crypto = require("crypto");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../core/errorCustom");
class UserController {
  async getAllUsers(req, res) {
    const { role, page = 1, limit = 10, total } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = total ? parseInt(total) : parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;
    let authQuery = {};

    if (role) authQuery.role = role;

    const auths = await AuthService.findRole(authQuery);
    const authIds = auths.map((auth) => auth._id);

    const query = {};
    if (authIds.length > 0) query.authId = { $in: authIds };
    const totalUsers = await UserService.countUsers(query);
    const users = await UserService.getAllUsers(query, skip, parsedLimit);

    res.status(200).json({
      data: users,
      total: totalUsers,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalUsers / parsedLimit),
    });
  }
  async createStaff(req, res) {
    const { name, sex, email, citizenID, phone, address, avatar } = req.body;

    const newStaff = await UserService.createNewStaff(
      name,
      sex,
      email,
      citizenID,
      phone,
      address,
      avatar
    );
    const username = generateUsername(email);
    const password = generatePassword(8);
    const role_id = "6800d06932b289b2fe5b0409";
    // console.log(username, password, role_id);

    const newAuth = await AuthService.createAccount(
      username,
      password,
      role_id
    );
    newStaff.authId = newAuth._id;
    await newStaff.save();
    sendAccount(name, email, username, password);
    return res.status(200).json({
      message: "Create new staff successfully",
      user: newStaff,
      auth: newAuth,
    });
  }

  async getUsertoCreateAccount(req, res) {
    try {
      console.log("getus: ", req.user.userID);
      const userID = req.user.userID;

      const user = await UserService.findById(userID);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const checkUser = await Auth.findById(user.authId);
      if (checkUser && checkUser.username) {
        return res.status(200).json({
          message: "User already has a username, no need to register again.",
        });
      }

      res.render("registerAccount.ejs", {
        user: user,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async registerAccount(req, res) {
    try {
      const { username, password } = req.body;
      const userID = req.params.id;
      console.log("userID: ", userID);

      if (!userID || !username || !password) {
        throw new BadRequestError("Missing required fields");
      }

      const user = await userModel.findById(userID);
      const auth = await Auth.findById(user.authId);

      if (!user) {
        throw new BadRequestError("User not found");
      }

      const existingUser = await Auth.findOne({ username });
      if (existingUser && existingUser._id.toString() !== auth._id.toString()) {
        throw new BadRequestError("Username already exists");
      }

      auth.username = username;
      auth.password = password;

      await auth.save();

      res.status(200).json({
        message: "Account updated successfully",
        user: {
          id: user._id,
          username: auth.username,
          role: user.role,
        },
        success: true,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }

  async loginAccount(req, res) {
    const { username, password } = req.body;
    if (!username) throw new BadRequestError("Username is required");
    if (!password) throw new BadRequestError("Password is required");

    const user = await UserService.findByUsername(username);
    if (!user) throw new NotFoundError("User not found");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Wrong password");

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  }
  async logoutAccount(req, res) {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Token is required.");

    const decoded = jwt.decode(token);
    const exp = decoded?.exp;

    if (!exp) throw new Error("Invalid token.");

    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.setex(`blacklist:${token}`, ttl, "blacklisted");
    }
    return res.status(200).json({ message: "Logout successful" });
  }
  async getUserInfo(req, res) {
    const requestedId = req.params.id;
    const user = await UserService.findById(requestedId);
    if (!user) throw new NotFoundError("User not found");

    const currentUserId = req.user.id;

    if (currentUserId !== user.authId.toString()) {
      throw new ForbiddenError("You do not have permission to access this id");
    }

    return res.status(200).json({
      message: "User information retrieved successfully",
      data: user,
    });
  }
  async getUserUpdate(req, res) {
    const userID = req.params.id;
    const user = await UserService.findById(userID);
    if (!user) throw new NotFoundError("User not found");
    const currentUserId = req.user.id;
    if (currentUserId !== user.authId.toString()) {
      throw new ForbiddenError("You do not have permission to access this id");
    }
    const data = req.body;

    const updatedUser = await UserService.updateUserById(userID, data);
    return res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  }

  async changePassword(req, res) {
    const authId = req.user.id;
    const user = await AuthService.findAccount(authId);
    if (!user) throw new NotFoundError("User not found");
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new BadRequestError("Wrong password");
    if (newPassword !== confirmPassword)
      throw new BadRequestError(
        "New password and confirm password do not match"
      );

    user.password = newPassword;
    await user.save();
    return res.status(200).json({
      message: "Password changed successfully",
    });
  }
  async forgotPassword(req, res) {
    const { username } = req.body;
    //AuthModel
    const userAuth = await AuthService.findByUsername(username);

    if (!userAuth) throw new NotFoundError("User not found");

    //Usermodel kiếm email
    const user = await UserService.findByAuthId(userAuth._id);
    if (!user || !user.email) throw new NotFoundError("Email not found");

    const token = crypto.randomBytes(20).toString("hex");
    const expires = Date.now() + 1000 * 60 * 10;
    userAuth.resetPasswordToken = token;
    userAuth.resetPasswordExpires = expires;
    console.log("Token", token);
    console.log("Token of user", userAuth.resetPasswordToken);
    await userAuth.save();

    await sendResetPasswordEmail(user.email, token);

    return res.status(200).json({
      message: "Reset password email sent successfully",
    });
  }
  async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!token) {
      throw new BadRequestError("Missing required fields");
    }
    if (newPassword !== confirmPassword)
      throw new BadRequestError(
        "New password and confirm password do not match"
      );

    const user = await AuthService.findByResetToken(token);
    if (!user) throw new BadRequestError("Invalid or expired token");

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  }
}

module.exports = new UserController();
