const courseModel = require('../models/CourseModel');
const CourseRegistrationModel = require('../models/CourseRegistrationModel');

class CourseService {
    async createCourse(data) {
        return await courseModel.create(data);
    }
    
    async getAllCourses() {
        return await courseModel.find({});
    }
    
    async getCourseById(id) {
        return await courseModel.findById(id);
    }

    async getSpecialCourse() {
        return await courseModel.find({ is_special: true });
    }

    async getCourseBySlug(slug) {
        return await courseModel.findOne({ slug: slug });
    }
    
    async updateCourse(id, data) {
        return await courseModel.findByIdAndUpdate(id, data, { new: true });
    }
    
    async deleteCourse(id) {
        return await courseModel.findByIdAndDelete(id);
    }

    // Registration methods

    async getAllRegistrations() {
        return await CourseRegistrationModel.find({}).populate('courseId').populate('studentId');
    }

    async getRegistrationById(id) {
        return await CourseRegistrationModel.findById(id).populate('courseId').populate('studentId');

    }

    async getRegistrationByUserId(id) {
        return await CourseRegistrationModel.find({
            studentId: id,
        }).populate('courseId');
    }
    
    async registerForCourse(courseId, studentId) {
        return await CourseRegistrationModel.create({
            courseId: courseId,
            studentId: studentId,
        });
    }
    
    async changeStatusRegistration(id, status) {
        return await CourseRegistrationModel.findByIdAndUpdate(id, { status: status }, { new: true });
    }

    async respondToRegistration(id, employeeId, status) {
        console.log("ID", id);
        
        return await CourseRegistrationModel.findByIdAndUpdate(id, {employeeId: employeeId, status: status }, { new: true });
    }
}

module.exports = new CourseService();