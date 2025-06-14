const courseModel = require("../models/CourseModel");
const CourseRegistrationModel = require("../models/CourseRegistrationModel");

class CourseService {
  async createCourse(data) {
    return await courseModel.create(data);
  }

  async getCourses(config) {
    if (!config) throw new Error("Config is required");
    if (!config.action) config.action = "getAll";

    // Phân trang
    const page = parseInt(config.page) || 1;
    const limit = parseInt(config.limit) || 10;
    const skip = (page - 1) * limit;

    // Xây dựng bộ lọc
    let filters = {};
    if (config.coursename) {
      filters.name = { $regex: config.coursename, $options: "i" };
    }
    if (config.status) {
      filters.status = config.status;
    }
    if (config.catalog) {
      filters.catalog = config.catalog;
    }

    // Có thể bổ sung thêm các filter khác nếu cần

    let query = courseModel.find(filters);

    // Áp dụng phân trang
    query = query.skip(skip).limit(limit);

    // Đếm tổng số bản ghi cho phân trang
    const total = await courseModel.countDocuments(filters);

    const courseData = await query.exec();
    return {
      data: courseData,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateCourse(id, data) {
    return await courseModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCourse(id) {
    return await courseModel.findByIdAndDelete(id);
  }

  // Registration methods

  async getRegistrations(config) {
    let query;
    if (!config) {
      throw new Error("Config is required");
    }
    if (!config.action) {
      config.action = "getAll";
    }
    switch (config.action) {
      case "getAll":
        query = CourseRegistrationModel.find();
        break;
      case "getById":
        query = CourseRegistrationModel.findById(config.id);
        break;
      case "getByStudentId":
        query = CourseRegistrationModel.find({ studentId: config.studentId });
        break;
      case "getByEmployeeId":
        query = CourseRegistrationModel.find({ employeeId: config.employeeId });
        break;
    }

    const registrationData = await query.exec();
    return registrationData;
  }

  async registerForCourse(courseId, studentId) {
    return await CourseRegistrationModel.create({
      courseId: courseId,
      studentId: studentId,
    });
  }

  async updateRegistration(config) {
    switch (config.action) {
      case "updateRegistration":
        return await CourseRegistrationModel.findByIdAndUpdate(
          config.id,
          config.data,
          { new: true }
        );
      case "changeStatus":
        return await CourseRegistrationModel.findByIdAndUpdate(
          config.id,
          { status: config.status },
          { new: true }
        );
      case "respondToRegistration":
        return await this.repondToRegistration(
          config.id,
          config.employeeId,
          config.status
        );
    }
  }

  async repondToRegistration(id, employeeId, status) {
    return await CourseRegistrationModel.findByIdAndUpdate(
      id,
      { employeeId: employeeId, status: status },
      { new: true }
    );
  }

  async deleteRegistration(id) {
    return await CourseRegistrationModel.findByIdAndDelete(id);
  }
}

module.exports = new CourseService();
