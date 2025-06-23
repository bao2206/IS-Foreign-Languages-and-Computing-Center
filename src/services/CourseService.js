const courseModel = require('../models/CourseModel');
const CourseRegistrationModel = require('../models/CourseRegistrationModel');

class CourseService {
    async createCourse(data) {
        return await courseModel.create(data);
    }
    
    async getCourses(config) {
        let query;
        if (!config) {
            throw new Error('Config is required');
        }
        if (!config.action) {
            config.action = "getAll";
        }
        switch (config.action) {
            case "getAll":
                query = courseModel.find()
                break;
            case "getByCourseId":
                query = courseModel.findById(config.courseId)
                break;
            case "getSpecial":
                query = courseModel.find({ is_special: true })
                break;
            case "getByStatus":
                query = courseModel.find({ status: config.status })
                break;
            case "getBySlug":
                query = courseModel.findOne({ slug: config.slug })
                break;
        }

        const courseData = await query.exec();
        return courseData;
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
            throw new Error('Config is required');
        }
        if (!config.action) {
            config.action = "getAll";
        }
        switch (config.action) {
            case "getAll":
                query = CourseRegistrationModel.find()
                break;
            case "getById":
                query = CourseRegistrationModel.findById(config.id)
                break;
            case "getByStudentId":
                query = CourseRegistrationModel.find({ studentId: config.studentId })
                break;
            case "getByEmployeeId":
                query = CourseRegistrationModel.find({ employeeId: config.employeeId })
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
                return await CourseRegistrationModel.findByIdAndUpdate(config.id, config.data, { new: true });
            case "changeStatus":
                return await CourseRegistrationModel.findByIdAndUpdate(config.id, { status: config.status }, { new: true });
            case "respondToRegistration":
                return await this.repondToRegistration(config.id, config.employeeId, config.status);
        }
    }

    async repondToRegistration(id, employeeId, status) {
        return await CourseRegistrationModel.findByIdAndUpdate(id, { employeeId: employeeId, status: status }, { new: true });
    }
    
    async deleteRegistration(id) {
        return await CourseRegistrationModel.findByIdAndDelete(id);
    }
    async getByCourseId(id){
        return await courseModel.findById(id);
    }
}

module.exports = new CourseService();