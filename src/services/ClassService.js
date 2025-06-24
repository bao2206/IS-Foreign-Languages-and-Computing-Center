const { config } = require("dotenv");
const ClassModel = require("../models/ClassModel");
const ScheduleModel = require("../models/ScheduleModel");
const ShedulesService = require("../services/SchedulesService");
const UserService = require("./userService");
const Contact = require("../models/ContactModel");
const CourseModel = require("../models/CourseModel");
const PaymentService = require("../services/PaymentService");

const mongoose = require("mongoose");

class ClassService {
  async getClassForTeacher(id, query = {}) {
    const teacher = await UserService.findByAuthId(id);
    const teacherId = teacher._id;

    if (!teacherId) {
      throw new Error("Teacher ID is required");
    }
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};
    if (query.name) {
      filters.classname = { $regex: query.name, $options: "i" };
    }
    filters.teachers = teacherId;

    const total = await ClassModel.countDocuments(filters);

    const classes = await ClassModel.find(filters)
      .populate({ path: "students", model: "User" })
      .populate({ path: "teachers", model: "User" })
      .populate("courseId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: classes,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Class CRUD operations
  async getClassForStudent(id, query = {}) {
    const student = await UserService.findByAuthId(id);
    const studentId = teacher._id;
    if (!studentId) {
      throw new Error("Student ID is required");
    }
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};
    if (query.name) {
      filters.classname = { $regex: query.name, $options: "i" };
    }
    filters.students = studentId;

    const total = await ClassModel.countDocuments(filters);

    const classes = await ClassModel.find(filters)
      .populate({ path: "students", model: "User" })
      .populate({ path: "teachers", model: "User" })
      .populate("courseId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: classes,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
  // Class CRUD operations
  async getClassesInformation(config) {
    if (!config) {
      throw new Error("Config is required");
    }
    if (!config.populates) {
      config.populates = [];
    }
    if (!config.action) {
      config.action = "getAll";
    }

    // Khởi tạo query
    let query;
    const filters = config.filters || {};
    const pagination = config.pagination || { page: 1, limit: 10 };

    // Xử lý bộ lọc
    const queryFilters = {};
    if (filters.name) {
      queryFilters.classname = { $regex: filters.name, $options: "i" };
    }
    if (filters.courseId) {
      queryFilters.courseId = filters.courseId;
    }
    if (filters.teacherId) {
      queryFilters.teachers = filters.teacherId;
    }
    if (filters.status) {
      queryFilters.status = filters.status;
    }
    if (filters.startDate && filters.endDate) {
      queryFilters.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    // Xử lý action
    switch (config.action) {
      case "getAll":
        query = ClassModel.find(queryFilters);
        break;
      case "getByClassesId":
        query = ClassModel.findById(config.classId);
        break;
      case "getByCourseId":
        query = ClassModel.find({ courseId: config.courseId });
        break;
      case "getByTeacherId":
        query = ClassModel.find({ teachers: config.teacherId });
        break;
      case "getByStudentId":
        query = ClassModel.find({ students: config.studentId });
        break;
      default:
        throw new Error("Invalid action");
    }

    // Áp dụng populate
    config.populates.forEach((populate) => {
      switch (populate) {
        case "students":
          query = query.populate({ path: "students", model: "User" });
          break;
        case "teachers":
          query = query.populate({ path: "teachers", model: "User" });
          break;
        case "course":
          query = query.populate("courseId");
          break;
        case "All":
          query = query
            .populate({ path: "students", model: "User" })
            .populate({ path: "teachers", model: "User" })
            .populate("courseId");
          break;
      }
    });

    // Áp dụng phân trang cho action "getAll"
    if (config.action === "getAll") {
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const skip = (page - 1) * limit;

      // Đếm tổng số bản ghi
      const total = await ClassModel.countDocuments(queryFilters);
      const totalPages = Math.ceil(total / limit);

      // Áp dụng skip và limit
      query = query.skip(skip).limit(limit);

      // Thực thi query
      const classData = await query.exec();

      return {
        data: classData,
        total,
        currentPage: page,
        totalPages,
      };
    } else {
      // Không phân trang cho các action khác
      const classData = await query.exec();
      return classData;
    }
  }

  async createClass(classData) {
    return await ClassModel.create(classData);
  }

  async configUpdateClass(config) {
    switch (config.action) {
      case "updateClass":
        return await this.updateClass(config.classId, config.data);

      case "addTeacher":
        return await this.addTeacherToClass(config.classId, config.teacherId);
      case "addStudent":
        return await this.addStudentToClass(config.classId, config.studentId);
    }
  }

  async updateClass(classId, classData) {
    return await ClassModel.findByIdAndUpdate(classId, classData, {
      new: true,
      runValidators: true,
    })
      .populate("courseId")
      .populate({ path: "students", model: "User" })
      .populate({ path: "teachers", model: "User" });
  }

  async addTeacherToClass(classId, teacherId) {
    const teacher = await mongoose
      .model("User")
      .findById(teacherId)
      .populate({
        path: "authId",
        populate: { path: "role" },
      });
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    if (teacher.authId.role.name !== "teacher") {
      throw new Error("User is not a teacher");
    }

    const classData = await ClassModel.findById(classId);

    if (classData.teachers.includes(teacherId)) {
      throw new Error("User is already a teacher of this class");
    }

    return await ClassModel.findByIdAndUpdate(
      classId,
      { $push: { teachers: teacherId } },
      { new: true }
    );
  }

  async addNewStudentToClass({ classId, contactId }) {
    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) throw new Error("Class not found");

    if (classDoc.students.length >= classDoc.quantity) throw new Error("Class is full");
    classDoc.students.push(studentId);
    await classDoc.save();

    const contact = await Contact.findById(contactId);
    if (!contact) throw new Error("Contact not found");


    const paymentData = {
      // student: studentId,
      studentName: contact.name,
      studentEmail : contact.email,
      studentPhone: contact.phone,
      // parent: contact.parentId || null,
      parentName: contact.parentName || "",
      parentEmail: contact.parentEmail || "",
      parentPhone: contact.parentPhone || "",
      course: course._id,
      courseName: course.coursename,
      coursePrice: course.price,
      class: classDoc._id,
      className: classDoc.classname,
      paymentDate: new Date(),
      status: "pending",
      contactStudent: contact,
      // paymentMethod is omitted for pending status
      history: [{
        action: "payment_initiated",
        by: studentId,
        date: new Date(),
        note: "Invoice created upon class assignment"
      }]
    };
    await PaymentService.createPayment(paymentData);

    contact.status = "class_assigned";
    await contact.save();

    return classDoc;
  }

  async removeStudentFromClass(classId, studentId) {
    return await ClassModel.findByIdAndUpdate(
      classId,
      { $pull: { students: studentId } },
      { new: true }
    );
  }

  async deleteClass(classId) {
    const schedules = await ShedulesService.getSchedules({
      action: "getByClassId",
      classId: classId,
    });

    if (schedules.length > 0) {
      const schedulesDel = await ShedulesService.deleteSchedule({
        action: "deleteAllSchedules",
        classId: classId,
      });
    }
    const classData = await ClassModel.findByIdAndDelete(classId);
    if (!classData) {
      throw new Error("Class not found");
    }
    return classData;
  }

  async getOpenClassesByCourseId(courseId) {
    const classes = await ClassModel.find({
      courseId: courseId,
      status: "Incomplete" // Open classes are those with "Incomplete" status
    })
    .populate({ path: "teachers", model: "User", select: "name email" })
    .populate("courseId", "coursename description price")
    .sort({ createdAt: -1 });

    return classes;
  }

  async addStudentToClass(classId, studentId) {
    const student = await mongoose
      .model("User")
      .findById(studentId)
      .populate({
        path: "authId",
        populate: { path: "role" },
      });

    if (!student) {
      throw new Error("Student not found");
    }

    if (student.authId.role.name !== "student") {
      throw new Error("User is not a student");
    }

    const classData = await ClassModel.findById(classId);

    if (classData.students.includes(studentId)) {
      throw new Error("User is already a student of this class");
    }

    const quantity = classData.quantity || classData.students.length + 1;
    if (quantity <= classData.students.length) {
      throw new Error("Class is full");
    }

    if (classData.status === "Complete") {
      throw new Error("Class is already complete");
    }

    return await ClassModel.findByIdAndUpdate(
      classId,
      { $push: { students: studentId } },
      { new: true }
    );
  }

}

module.exports = new ClassService();
