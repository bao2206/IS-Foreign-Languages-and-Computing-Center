const Exam = require('../models/ExamModel');
const mongoose = require('mongoose');
const ClassModel = require('../models/ClassModel');
const CourseModel = require('../models/CourseModel');

class ExamService {
    async getExams(config) {
        let query;
        if (!config) {
            throw new Error('Config is required');
        }
        if (!config.populates) {
            config.populates = [];
        }
        if (!config.action) {
            config.action = "getAll";
        }
        switch (config.action) {
            case "getAll":
                query = Exam.find()
                break;
            case "getByExamId":
                query = Exam.findById(config.examId)
                break;
            case "getByCourseId":
                query = Exam.find({ courseId: config.courseId })
                break;
            case "getByStudentId":
                query = Exam.find({ students: config.studentId })
                break;
        }
        config.populates.forEach((populate) => {
            switch (populate) {
                case "students":
                    query = query.populate({ path: 'students', model: 'User' })
                    break;
                case "course":
                    query = query.populate('courseId')
                    break;
                case "All":
                    query = query.populate('User')
                        .populate({ path: 'students', model: 'User' })
                        .populate({ path: 'teachers', model: 'User' })
                        .populate('courseId')
                    break;
            }
        })

        const examData = await query.exec();
        return examData;
    }

    async createExam(examData) {
        const { courseId } = examData;
        const course = await CourseModel.findById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }
        const exam = await Exam.create(examData);

        return exam;
    }
 
    async updateExam(config) {
        switch (config.action) {
            case "updateExam":
                return await Exam.findByIdAndUpdate(config.examId, config.examData, { new: true });
            case "addStudent":
                return await Exam.findByIdAndUpdate(config.examId, { $addToSet: { students: config.studentId } }, { new: true });
            case "removeStudent":
                return await Exam.findByIdAndUpdate(config.examId, { $pull: { students: config.studentId } }, { new: true });
            case "changeStatus":
                return await Exam.findByIdAndUpdate(config.examId, { status: config.status }, { new: true });
            case "changeTime":
                return await Exam.findByIdAndUpdate(config.examId, { startTime: config.startTime, endTime: config.endTime}, { new: true });
            case "changeDate":
                return await Exam.findByIdAndUpdate(config.examId, { date: config.date }, { new: true });
            case "changeRoom":
                return await Exam.findByIdAndUpdate(config.examId, { room: config.room }, { new: true });
            default:
                throw new Error('Invalid action for updating exam');
        }
    }

    async deleteExam(examId) {
        console.log(examId);
        
        const exam = await Exam.findByIdAndDelete(examId);
        if (!exam) {
            throw new Error('Exam not found');
        }
        return exam;
    }
}

module.exports = new ExamService();