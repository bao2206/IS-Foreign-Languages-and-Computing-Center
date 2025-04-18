const UserService = require("../services/userService");
const { sendEmailService } = require("../services/emailService");
const Auth = require("../models/AuthModel");
const jwt = require("jsonwebtoken");
const redis = require("../utils/redis");

const userModel = require("../models/UserModel");
const TeacherService = require("../services/teacherService");

const { BadRequestError, NotFoundError } = require("../core/errorCustom");
class UserController {
  async getAllUsers(req, res) {
    res.send("User route is working!");
  }
  async createUser(req, res) {
    const data = req.body;
    const user = await UserService.create(data);
    if (!user) {
      return res.status(400).json({
        message: "User creation failed",
      });
    }

    sendEmailService(user.email, user._id, user.name);

    return res.status(201).json({
      message: "User created successfully",
      data: user,
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
  async getUserUpdate(req, res) {
    const userID = req.params.id;
    const data = req.body;

    const user = await UserService.findById(userID);
    if(!user) throw new NotFoundError("User not found");
    const updatedUser = await UserService.updateUserById(userID, data);
    return res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  }

  async getTechers(req, res) {
    console.log("get teachers");
    
    const teachers = await TeacherService.getAllTeachers();
    if (!teachers) {
      return res.status(404).json({
        message: "No teachers found",
      });
    }

    return res.status(200).json({
      message: "Teachers retrieved successfully",
      data: teachers,
    });
  }

  async getTeacherById(req, res) {
    const teacherID = req.params.id;
    const teacher = await TeacherService.getTeacherById(teacherID);
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      message: "Teacher retrieved successfully",
      data: teacher,
    });
  }

  async updateTeacherById(req, res) {
    console.log("update teacher");
    
    const teacherID = req.params.id;
    const data = req.body;

    const teacher = await TeacherService.getTeacherById(teacherID);
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    const updatedTeacher = await TeacherService.updateTeacherById(teacherID, data);
    return res.status(200).json({
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  }

  async getTeacherCertificate(req, res) {
    const teacherID = req.params.id;
    const teacher = await TeacherService.getTeacherById(teacherID);
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    const certificates = await TeacherService.getCertificatesByTeacherId(teacherID);
    if (!certificates || certificates.length === 0) {
      return res.status(404).json({
        message: "No certificates found for this teacher",
      });
    }

    return res.status(200).json({
      message: "Teacher certificate retrieved successfully",
      data: certificates,
    });
  }

  async createCertificate(req, res) {
    console.log("create certificate");
    
    const teacherID = req.params.id;
    const data = req.body;

    const teacher = await TeacherService.getTeacherById(teacherID);
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    const certificate = await TeacherService.createCertificate(teacherID, data);
    return res.status(201).json({
      message: "Certificate created successfully",
      data: certificate,
    });
  }

  async updateCertificate(req, res) {
    const teacherID = req.params.id;
    const data = req.body;
    
    const teacher = await TeacherService.getTeacherById(teacherID);
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }
    const certificateID = req.body._id;
    console.log("certificateID: ", certificateID);
    
    const certificate = await TeacherService.getCertificateById(certificateID);
    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }
    const updatedCertificate = await TeacherService.updateCertificate(certificateID, data);
  }

}

module.exports = new UserController();
