const courseModel = require("../models/CourseModel");
const CourseRegistrationModel = require("../models/CourseRegistrationModel");

class CourseService {
  async createCourse(data) {
    return await courseModel.create(data);
  }

  async getCourses(config) {
    let query;
    if (!config) {
      throw new Error("Config is required");
    }
    if (!config.action) {
      config.action = "getAll";
    }
    switch (config.action) {
      case "getAll":
        query = courseModel.find();
        break;
      case "getByCourseId":
        query = courseModel.findById(config.courseId);
        break;
      case "getSpecial":
        query = courseModel.find({ is_special: true });
        break;
      case "getByStatus":
        query = courseModel.find({ status: config.status });
        break;
      case "getBySlug":
        query = courseModel.findOne({ slug: config.slug });
        break;
    }

    const courseData = await query.exec();
    return courseData;
  }

  async getCourseWithFilter(config) {
    if (!config) throw new Error("Config is required");
    if (!config.action) config.action = "getAll";

    // Pagination
    const page = parseInt(config.page) || 1;
    const limit = parseInt(config.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filters
    let filters = {};
    if (config.name) {
      filters.coursename = { $regex: config.name, $options: "i" };
    }
    if (config.status) {
      filters.status = config.status;
    }
    if (config.catalog) {
      filters.catalog = config.catalog;
    }
    if (typeof config.is_special !== "undefined") {
      filters.is_special = config.is_special;
    }

    let query = courseModel.find(filters);

    // Sorting
    if (config.sort) {
      query = query.sort(config.sort);
    }

    // Apply pagination
    query = query.skip(skip).limit(limit);

    // Count total documents for pagination
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
  async getByCourseId(id) {
    return await courseModel.findById(id);
  }
}

module.exports = new CourseService();
