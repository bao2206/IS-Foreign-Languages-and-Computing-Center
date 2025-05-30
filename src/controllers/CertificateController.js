const TeacherService = require("../services/teacherService");
const UserService = require("../services/userService");
const { ErrorCustom } = require("../core/errorCustom");

class CertificateController {
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

    const updatedTeacher = await TeacherService.updateTeacherById(
      teacherID,
      data
    );
    return res.status(200).json({
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  }

  async getTeacherCertificate(req, res) {
    const teacherID = req.params.id;

    const certificates = await TeacherService.getCertificatesByTeacherId(
      teacherID
    );
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

    const certificate = await TeacherService.createCertificate(teacherID, data);
    return res.status(201).json({
      message: "Certificate created successfully",
      data: certificate,
    });
  }

  async updateCertificate(req, res) {
    const teacherID = req.params.id;
    const data = req.body;

    const certificateID = req.body._id;
    console.log("certificateID: ", certificateID);

    const certificate = await TeacherService.getCertificateById(certificateID);
    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }
    const updatedCertificate = await TeacherService.updateCertificate(
      certificateID,
      data
    );
  }
}

module.exports = new CertificateController();
