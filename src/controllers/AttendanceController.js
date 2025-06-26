const AttendanceService = require("../services/AttendanceService");

class AttendanceController {
  async createAttendance(req, res) {
    try {
      const attendanceData = req.body;
      const attendance = await AttendanceService.createAttendance(
        attendanceData
      );
      return res.status(201).json({
        message: "Attendance created successfully",
        data: attendance,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error creating attendance",
        error: error.message,
      });
    }
  }

  async getAttendanceByClassIdAndDate(req, res) {
    try {
      console.log("Request body:", req.body);

      const { classId, date } = req.body;
      if (!classId || !date) {
        return res.status(400).json({
          message: "Class ID and date are required",
        });
      }
      const attendance = await AttendanceService.getAttendanceByClassIdAndDate(
        classId,
        new Date(date)
      );
      if (!attendance) {
        return res.status(404).json({
          message: "Attendance not found for this class and date",
        });
      }
      return res.status(200).json({
        message: "Attendance retrieved successfully",
        data: attendance,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving attendance",
        error: error.message,
      });
    }
  }

  async getAttendanceById(req, res) {
    try {
      const attendanceId = req.params.id;
      const attendance = await AttendanceService.getAttendanceById(
        attendanceId
      );
      if (!attendance) {
        return res.status(404).json({
          message: "Attendance not found",
        });
      }
      return res.status(200).json({
        message: "Attendance retrieved successfully",
        data: attendance,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving attendance",
        error: error.message,
      });
    }
  }

  async getAttendanceByStudentId(req, res) {
    try {
      const studentId = req.params.studentId;
      const attendance = await AttendanceService.getAttendanceByStudentId(
        studentId
      );
      if (!attendance || attendance.length === 0) {
        return res.status(404).json({
          message: "No attendance records found for this student",
        });
      }
      return res.status(200).json({
        message: "Attendance records retrieved successfully",
        data: attendance,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving attendance records",
        error: error.message,
      });
    }
  }

  async updateAttendance(req, res) {
    try {
      const attendanceId = req.params.id;
      const updateData = req.body;
      const updatedAttendance = await AttendanceService.updateAttendance(
        attendanceId,
        updateData
      );
      if (!updatedAttendance) {
        return res.status(404).json({
          message: "Attendance not found",
        });
      }
      return res.status(200).json({
        message: "Attendance updated successfully",
        data: updatedAttendance,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error updating attendance",
        error: error.message,
      });
    }
  }

  async deleteAttendance(req, res) {
    try {
      const attendanceId = req.params.id;
      const deletedAttendance = await AttendanceService.deleteAttendance(
        attendanceId
      );
      if (!deletedAttendance) {
        return res.status(404).json({
          message: "Attendance not found",
        });
      }
      return res.status(200).json({
        message: "Attendance deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error deleting attendance",
        error: error.message,
      });
    }
  }
}

module.exports = new AttendanceController();
