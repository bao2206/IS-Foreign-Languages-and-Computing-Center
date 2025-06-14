const userModel = require("../models/UserModel");
const authModel = require("../models/AuthModel");
const CertificateModel = require("../models/CertificateModel");
const RoleService = require("./RoleService");
const AuthService = require("./AuthService");
class TeacherService {
  async getAllTeachers() {
    try {
      // Tìm role "teacher"
      const role = await RoleService.findRole("teacher");
      if (!role) throw new Error("Role 'teacher' not found");

      // Lấy tất cả user có authId liên kết tới Auth có role là "teacher"
      const users = await userModel
        .find({ authId: { $exists: true } })
        .populate({
          path: "authId",
          select: "username role",
          match: { role: role._id },
        });

      // Lọc ra user có authId khác null (tức là đúng role teacher)
      return users.filter((user) => user.authId);
    } catch (error) {
      throw error;
    }
  }

  async getTeacherById(teacherId) {
    try {
      return await userModel.findById(teacherId).populate("authId", "username");
    } catch (error) {
      throw error;
    }
  }

  async updateTeacherById(teacherId, data) {
    try {
      const teacher = await userModel.findById(teacherId);
      if (!teacher) throw new Error("Teacher not found");

      const { name, email, citizenID, phone, avatar, status, address } = data;
      teacher.name = name || teacher.name;
      teacher.email = email || teacher.email;
      teacher.citizenID = citizenID || teacher.citizenID;
      teacher.phone = phone || teacher.phone;
      teacher.avatar = avatar || teacher.avatar;
      teacher.status = status || teacher.status;
      if (address) {
        teacher.address.street = address.street || teacher.address.street;
        teacher.address.city = address.city || teacher.address.city;
        teacher.address.country = address.country || teacher.address.country;
      }
      return await teacher.save();
    } catch (error) {
      throw error;
    }
  }

  async createCertificate(teacherId, data) {
    try {
      data.receivedDate = new Date(data.receivedDate);
      data.expirationDate = new Date(data.expirationDate);
      if (data.expirationDate <= data.receivedDate) {
        throw new Error("Expiration date must be after the received date");
      }
      const certificate = await CertificateModel.create({
        teacherId,
        ...data,
      });
      return certificate;
    } catch (error) {
      throw error;
    }
  }

  async getCertificatesByTeacherId(teacherId) {
    try {
      return await CertificateModel.find({ teacherId });
    } catch (error) {
      throw error;
    }
  }

  async getCertificateById(certificateId) {
    try {
      return await CertificateModel.findById(certificateId);
    } catch (error) {
      throw error;
    }
  }

  async updateCertificate(certificateId, data) {
    try {
      return await CertificateModel.findByIdAndUpdate(certificateId, data, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteCertificate(certificateId) {
    try {
      return await CertificateModel.findByIdAndDelete(certificateId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TeacherService();
