const AttendanceModel = require("../models/AttendanceModel");

class AttendanceService {
  async createAttendance(attendanceData) {
    const { classId, date } = attendanceData;
    if (!classId || !date) {
      throw new Error("Class ID and date are required to create attendance.");
    }
    // Check if attendance for this class and date already exists
    const existingAttendance = await AttendanceModel.findOne({})
      .where("classId")
      .equals(classId)
      .where("date")
      .equals(date);
    if (existingAttendance) {
      const updateAttendance = await AttendanceModel.findByIdAndUpdate(
        existingAttendance._id,
        { $set: { students: attendanceData.students } },
        { new: true }
      );
      return updateAttendance;
    }
    return await AttendanceModel.create(attendanceData);
  }

  async getAttendanceByClassIdAndDate(classId, date) {
    if (!classId || !date) {
      throw new Error("Class ID and date are required to get attendance.");
    }
    const attendance = await AttendanceModel.findOne({ classId, date })
      .populate("students.studentId")
      .populate("classId");
    console.log(
      "Attendance retrieved:",
      attendance.students.map((s) => s.studentId)
    );

    return attendance;
  }

  async getAttendanceById(id) {
    return await this.attendanceModel
      .findById(id)
      .populate("students.studentId")
      .populate("classId");
  }

  async getAttendanceByStudentId(studentId) {
    const attendanceRecords = await AttendanceModel.find({
      "students.studentId": studentId,
    })
      .populate("teacherId")
      .populate("students.studentId")
      .populate("classId");

    // Gom nhóm theo classId
    const classMap = {};

    attendanceRecords.forEach((record) => {
      const classId = record.classId._id.toString();
      const className = record.classId.classname;

      // Lọc ra các lần điểm danh của student này trong buổi này
      const studentAttendances = record.students
        .filter(
          (student) =>
            student.studentId && student.studentId._id.toString() === studentId
        )
        .map((student) => ({
          date: record.date.toISOString().split("T")[0],
          class: className,
          classId: classId,
          studentId: student.studentId._id,
          status: student.status,
          teacher: record.teacherId ? record.teacherId.name : "Unknown",
        }));

      if (!classMap[classId]) {
        classMap[classId] = {
          classId: classId,
          className: className,
          attendances: [],
        };
      }
      classMap[classId].attendances.push(...studentAttendances);
    });

    // Chuyển object thành mảng
    const result = Object.values(classMap);

    return result;
  }

  async updateAttendance(id, updateData) {
    return await AttendanceModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  async deleteAttendance(id) {
    return await AttendanceModel.findByIdAndDelete(id);
  }

  async getAllAttendances() {
    return await AttendanceModel.find()
      .populate("students.studentId")
      .populate("classId");
  }
}
module.exports = new AttendanceService();
