const Exam = require('../models/ExamModel');
const mongoose = require('mongoose');
const ClassModel = require('../models/ClassModel');

const StudentModel = require('../models/StudentModel');

class ExamService {
    async getAllExams() {
        return await Exam.find().populate('students').populate('courseId');
    }

    async getExamById(examId) {
        return await Exam.findById(examId).populate('students').populate('courseId');
    }

    async getExamsByCourseId(courseId) {
        return await Exam.find({ courseId }).populate('students').populate('courseId');
    }

    async getExamsByStudentId(studentId) {
        const exams = await Exam.find({ students: studentId }).populate('courseId');
        return exams;
    }

    async createExam(examData) {
        const { students, courseId } = examData;
        const course = await ClassModel.findById(courseId).populate('students');
        if (!course) {
            throw new Error('Course not found');
        }
        const exam = await Exam.create(examData);
        await ClassModel.findByIdAndUpdate(courseId, { $addToSet: { exams: exam._id } });
        return exam;
    }
 
    async updateExam(examId, examData) {
        return await Exam.findByIdAndUpdate(
            examId,
            examData,
            { new: true, runValidators: true }
        );
    }
}

module.exports = new ExamService();