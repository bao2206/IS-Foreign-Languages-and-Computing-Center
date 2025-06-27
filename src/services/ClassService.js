const { config } = require("dotenv");
const ClassModel = require("../models/ClassModel");
const ScheduleModel = require("../models/ScheduleModel");
const ShedulesService = require("../services/SchedulesService");
const UserService = require("./userService");
const Contact = require("../models/ContactModel");
const CourseModel = require("../models/CourseModel");
const PaymentService = require("../services/PaymentService");
const StudentModel = require("../models/StudentModel");

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
      .populate({
        path: "students.student", // populate trường student trong mảng students
        model: "User",
      })
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

    const studentId = student._id;
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
    // Sử dụng $elemMatch để kiểm tra studentId trong mảng students
    filters.students = {
      $elemMatch: {
        $or: [
          { _id: studentId }, // Trường hợp students chứa _id trực tiếp
          { student: studentId }, // Trường hợp students chứa object với student._id
        ],
      },
    };

    const total = await ClassModel.countDocuments(filters);

    const classes = await ClassModel.find(filters)
      .populate({ path: "students.student", model: "User" }) // Populate chi tiết student trong students
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

    query = query.populate({
      path: "students.student", // populate trường student trong mảng students
      model: "User",
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

  async addNewStudentToClass(classId, contactId) {
    // 1. Retrieve class and contact

    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) throw new Error("Class not found");
    if (classDoc.students.length >= classDoc.quantity)
      throw new Error("Class is full");

    const contact = await Contact.findById(contactId);
    if (!contact) throw new Error("Contact not found");

    // 2. Get student name (or parent's name if not available)
    const studentName = contact.name || contact.parentName || "Unnamed Student";
    const studentEmail = contact.email || undefined;
    const studentPhone = contact.phone || undefined;

    // 3. Create UserModel for student
    const user = await UserService.createNewStaff({
      name: studentName,
      email: studentEmail,
      phone: studentPhone,
    });
    // console.log("user", user)
    // 4. Create StudentModel and link to user and class
    let student = await StudentModel.create({
      userId: user._id,
      classId: [classId],
    });
    // console.log("student", student)
    // 5. If parent info exists, create parent user and ParentModel, link student
    let parent = null;
    if (contact.parentName || contact.parentEmail || contact.parentPhone) {
      // Create User for parent
      const parentUser = await UserService.createNewStaff({
        name: contact.parentName || `Parent of ${studentName}`,
        email: contact.parentEmail || undefined,
        phone: contact.parentPhone || undefined,
      });
      // Create or update ParentModel
      const ParentModel = require("../models/ParentModel");
      parent = await ParentModel.findOne({ userId: parentUser._id });
      if (!parent) {
        parent = await ParentModel.create({
          userId: parentUser._id,
          phone: contact.parentPhone || undefined,
          students: [student._id],
        });
      } else {
        // Add student to parent's students array if not already present
        if (!parent.students.includes(student._id)) {
          parent.students.push(student._id);
          await parent.save();
        }
      }
      // Set student's parentId
      // student.parentId = parent._id;
      // await student.save();
    }

    // 6. Update class to include this student with status 'pending tuition payment'
    classDoc.students.push({
      student: user._id,
      status: "pending tuition payment",
    });
    await classDoc.save();

    // 7. Create invoice (payment)
    let course = null;
    if (classDoc.courseId) {
      course = await CourseModel.findById(classDoc.courseId);
    }
    // console.log("course", course)
    const paymentData = {
      student: user._id,
      studentName: studentName,
      studentEmail: studentEmail,
      studentPhone: studentPhone,
      parent: parent ? parent._id : null,
      parentName: contact.parentName || "",
      parentEmail: contact.parentEmail || "",
      parentPhone: contact.parentPhone || "",
      course: course ? course._id : undefined,
      courseName: course ? course.coursename : undefined,
      coursePrice: course ? course.price : undefined,
      class: classDoc._id,
      className: classDoc.classname,
      paymentDate: new Date(),
      status: "pending",
      history: [
        {
          action: "payment_initiated",
          by: user._id,
          date: new Date(),
          note: "Invoice created upon class assignment",
        },
      ],
    };

    // console.log("payment" , paymentData)
    // console.log("2")
    await PaymentService.createPayment(paymentData);

    // 8. Update contact status
    contact.status = "class_assigned";
    await contact.save();

    return { class: classDoc, student, user, parent };
    // return paymentData;
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
      status: "Incomplete", // Open classes are those with "Incomplete" status
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
