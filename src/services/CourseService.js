const courseModel = require('../models/CourseModel');
const CourseRegistrationModel = require('../models/CourseRegistrationModel');

class CourseService {
    async createCourse(data) {
        return await courseModel.create(data);
    }
    
    async getAllCourses() {
        return await courseModel.find({}).populate('enrollments');
    }
    
    async getCourseById(id) {
        return await courseModel.findById(id).populate('enrollments');
    }
    
    async updateCourse(id, data) {
        return await courseModel.findByIdAndUpdate(id, data, { new: true });
    }
    
    async deleteCourse(id) {
        return await courseModel.findByIdAndDelete(id);
    }

    // Registration methods
    
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
        return await CourseRegistrationModel.findByIdAndUpdate(id, {employeeId: employeeId, status: status }, { new: true });
    }
}