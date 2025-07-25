const UserService = require("../services/userService");
const {
  sendAccount,
  sendResetPasswordEmail,
} = require("../services/emailService");
const { generateUsername, generatePassword } = require("../utils/userUtils");
// const Auth = require("../models/AuthModel");
const jwt = require("jsonwebtoken");
const redis = require("../utils/redis");
const RoleService = require("../services/RoleService");
// const userModel = require("../models/UserModel");
const AuthService = require("../services/AuthService");
const PermissionService = require("../services/PermissionService");
const mongoose = require("mongoose");
const { Types } = mongoose;
const crypto = require("crypto");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../core/errorCustom");
const { validateFields } = require("../utils/validators");

const decodeToken = require("../utils/decodeToken");

class UserController {
  async getAllUsers(req, res) {
    const { role, page = 1, limit = 10, search, status, sex } = req.query;
    // console.log(role, search, status)
    // Parse pagination parameters
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build query object
    const query = {};
    let flag = true;
    // Role-based filtering
    if (role) {
      if (!Types.ObjectId.isValid(role)) {
        throw new BadRequestError("Invalid role ID format");
      }

      const auths = await AuthService.findRole({ role });
      if (!auths || auths.length === 0) {
        flag = false;
        return res.status(200).json({
          data: [],
          total: 0,
          currentPage: parsedPage,
          totalPages: 0,
          limit: parsedLimit,
        });
      }

      const authIds = auths.map((auth) => auth._id);
      query.authId = { $in: authIds };
    }
    if (status) {
      query.status = status;
    }

    if (sex) {
      query.sex = sex;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        // { citizenId: searchRegex },
      ];
    }
    // console.log("64",query)
    // const
    let totalUsers = 0;
    // console.log(totalUsers)
    let users = [];
    if (flag) {
      users = await UserService.getAllUsers(query, skip, parsedLimit);
      totalUsers = await UserService.countUsers(query);
    }

    res.status(200).json({
      data: users,
      total: totalUsers,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalUsers / parsedLimit),
      limit: parsedLimit,
    });
  }

  async getUserProfile(req, res) {
    let token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) token = req.query.token || req.params.token;
    let userId = "";
    jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
      if (error) return next(new UnAuthorizedError("Invalid token."));

      userId = decoded.id;
    });

    const user = await UserService.getUserProfile(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return res.status(200).json({
      message: "User profile retrieved successfully",
      data: user,
    });
  }

  async updateUserProfile(req, res) {
    const user = req.body;

    let token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) token = req.query.token || req.params.token;
    const decode = await decodeToken(token);
    const updatedUser = await UserService.updateUserProfile(decode.id, user);
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }
    return res.status(200).json({
      message: "User profile updated successfully",
      data: updatedUser,
    });
  }

  async createStaff(req, res) {
    const { name, role, email, phone, citizenID } = req.body;
    console.log(req.body);
    // Validate fields if provided
    const validation = validateFields({ phone, email, citizenID });
    if (!validation.isValid) {
      throw new BadRequestError(validation.errors);
    }
    const checkEmail = await UserService.checkEmail(email);
    if (checkEmail) {
      throw new BadRequestError("Email already exists");
    }
    const checkPhone = await UserService.checkPhone(phone);
    if (checkPhone) {
      throw new BadRequestError("Phone already exists");
    }

    const checkCitizenId = await UserService.checkCitizenId(citizenID);
    console.log(checkCitizenId);
    if (checkCitizenId) {
      throw new BadRequestError("Citizen ID already exists");
    }

    const newStaff = await UserService.createNewStaff(req.body);
    const username = generateUsername(email);
    const password = generatePassword(8);
    const role_id = await RoleService.findRole(role);

    const newAuth = await AuthService.createAccount(
      username,
      password,
      role_id
    );
    newStaff.authId = newAuth._id;
    await newStaff.save();
    await sendAccount(name, email, username, password);
    return res.status(200).json({
      message: "Create new staff successfully",
      user: newStaff,
      auth: newAuth,
    });
  }

  // async getUsertoCreateAccount(req, res) {
  //   try {
  //     console.log("getus: ", req.user.userID);
  //     const userID = req.user.userID;

  //     const user = await UserService.findById(userID);
  //     if (!user) {
  //       return res.status(404).json({
  //         message: "User not found",
  //       });
  //     }

  //     const checkUser = await Auth.findById(user.authId);
  //     if (checkUser && checkUser.username) {
  //       return res.status(200).json({
  //         message: "User already has a username, no need to register again.",
  //       });
  //     }

  //     res.render("registerAccount.ejs", {
  //       user: user,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  //client
  // async registerAccount(req, res) {
  //   const { username, name, email, password, confirmPassword, phone, citizenId } = req.body;

  //   // Validate required fields
  //   if (!username || !password || !email || !name) {
  //     throw new BadRequestError(
  //       "Missing required fields: username, password, email, and name are required"
  //     );
  //   }

  //   // Validate optional fields if provided
  //   const validation = validateFields({ phone, email, citizenId });
  //   if (!validation.isValid) {
  //     throw new BadRequestError(validation.errors);
  //   }
  //   const checkEmail = await UserService.checkEmail(email);
  //   if(checkEmail){
  //     throw new BadRequestError("Email already exists");
  //   }
  //   const checkPhone = await UserService.checkPhone(phone);
  //   if(checkPhone){
  //     throw new BadRequestError("Phone already exists");
  //   }
  //   const checkCitizenId = await UserService.checkCitizenId(citizenId);
  //   if(checkCitizenId){
  //     throw new BadRequestError("Citizen ID already exists");
  //   }
  //   // Validate password match
  //   if (password !== confirmPassword) {
  //     throw new BadRequestError("Password and confirm password do not match");
  //   }

  //   // Check if username already exists
  //   const usernameExist = await AuthService.findByUsername(username);
  //   if (usernameExist) {
  //     throw new BadRequestError("Username already exists");
  //   }

  //   // Check if email already exists
  //   const emailExist = await UserService.checkEmail(email);
  //   if (emailExist) {
  //     throw new BadRequestError("Email already exists");
  //   }

  //   // Create new auth account with default role
  //   const role_id = "6800d06932b289b2fe5b0403"; // Default role ID
  //   const newAuth = await AuthService.createAccount(
  //     username,
  //     password,
  //     role_id
  //   );

  //   // Create new user with the auth account
  //   const newUser = await UserService.createNewStaff({
  //     name,
  //     email,
  //     phone,
  //     citizenId,
  //     authId: newAuth._id,
  //   });

  //   // Send account details to user's email
  //   await sendAccount(name, email, username, password);

  //   return res.status(201).json({
  //     message: "Account registered successfully",
  //     user: {
  //       id: newUser._id,
  //       username: newUser.username,
  //       email: newUser.email,
  //       phone: newUser.phone,
  //       citizenId: newUser.citizenId,
  //       authId: newUser.authId,
  //     },
  //     success: true,
  //   });
  // }

  async loginAccount(req, res) {
    const { username, password } = req.body;
    if (!username) throw new BadRequestError("Username is required");
    if (!password) throw new BadRequestError("Password is required");

    const user = await UserService.findByUsername(username);
    if (!user) throw new NotFoundError("User not found");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Wrong password");

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
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
    const userID = req.body._id;
    const user = await UserService.findById(userID);
    if (!user) throw new NotFoundError("User not found");

    const { phone, email, citizenId } = req.body;

    // Validate fields if provided
    const validation = validateFields({ phone, email, citizenId });
    if (!validation.isValid) {
      throw new BadRequestError(validation.errors);
    }

    const updatedUser = await UserService.updateUserById(userID, req.body);
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
  async addCustomPermissions(req, res) {
    const { id } = req.params;
    const { permissions } = req.body;
    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new ErrorCustom("Permissions must be a non-empty array", 400);
    }
    const allPermission = await PermissionService.findAllPermission();
    const validPermissionIds = new Set(allPermission.map((p) => String(p._id)));

    const invalidPermissions = permissions.filter(
      (p) => !validPermissionIds.has(p)
    );
    if (invalidPermissions.length > 0) {
      throw new ErrorCustom(
        `Invalid permission IDs: ${invalidPermissions.join(", ")}`,
        400
      );
    }
    const user = await UserService.addMultiplePermissions(id, permissions);

    if (!user) throw new NotFoundError("User not found");

    res.status(200).json({
      message: "Permissions added successfully",
      data: user,
    });
  }
  async removeCustomPermission(req, res) {
    const { id, permissionId } = req.params;

    const userId = await UserService.findByIdOfAuth(id);
    if (!userId) throw new NotFoundError("User not found");
    const permission = await PermissionService.findId(permissionId);
    if (!permission) throw new NotFoundError("Permission not found");
    // console.log("Permission", userId);
    const exits = await UserService.checkCustomPermission(userId, permissionId);
    if (!exits)
      throw new NotFoundError("Permission not found in user's permissions");
    console.log("Exits", exits);
    const user = await UserService.removeCustomPermission(id, permissionId);
    if (!user) throw new NotFoundError("User not found");

    res.status(200).json({
      message: "Permission removed successfully",
      data: user,
    });
  }
  async updateRole(req, res) {
    const { id } = req.body;
    const { role_id } = req.body;

    // const userId = await UserService.findByIdOfAuth(id);
    // if (!userId) throw new NotFoundError("User not found");
    const role = await RoleService.findRoleById(role_id);

    // const role = await RoleService.getAllRoles();
    if (!role) throw new NotFoundError("Role not found");
    const updatedUser = await UserService.updateUserRole(id, role);

    res.status(200).json({
      message: "User role updated successfully",
      data: updatedUser,
    });
  }

  async getUsersAreStaff(req, res) {
    const users = await UserService.getUsersAreStaff();

    res.status(200).json({
      data: users,
    });
  }

  async validateUserFields(req, res) {
    const { phone, email, citizenId } = req.body;

    const validation = validateFields({ phone, email, citizenId });

    if (!validation.isValid) {
      throw new BadRequestError(validation.errors);
    }

    return res.status(200).json({
      message: "Fields are valid",
      data: { phone, email, citizenId },
    });
  }

  async getAllStudents(req, res) {
    const { page = 1, limit = 10, search, status, sex } = req.query;

    // Parse pagination parameters
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build query object
    const query = {};

    // Get student role ID
    const studentRole = await RoleService.findRole("student");
    if (!studentRole) {
      throw new NotFoundError("Student role not found");
    }

    // Get all auth IDs with student role
    const auths = await AuthService.findRole({ role: studentRole._id });
    if (!auths || auths.length === 0) {
      return res.status(200).json({
        data: [],
        total: 0,
        currentPage: parsedPage,
        totalPages: 0,
        limit: parsedLimit,
      });
    }

    const authIds = auths.map((auth) => auth._id);
    query.authId = { $in: authIds };

    // Add additional filters
    if (status) {
      query.status = status;
    }

    if (sex) {
      query.sex = sex;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ];
    }

    const users = await UserService.getAllUsers(query, skip, parsedLimit);
    const totalUsers = await UserService.countUsers(query);

    res.status(200).json({
      data: users,
      total: totalUsers,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalUsers / parsedLimit),
      limit: parsedLimit,
    });
  }
}

module.exports = new UserController();
