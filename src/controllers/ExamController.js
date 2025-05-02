const ExamService = require('../services/ExamService');
const {ErrorCustom} = require("../core/errorCustom");

class ExamController {
    async createExam(req, res) {
        try {
            const exam = await ExamService.createExam(req.body.examData);
            return res.status(201).json(exam);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async getExams(req, res) {
        try {     
            const exams = await ExamService.getExams(req.body.config);
            if (!exams) {
                return res.status(404).json({ message: 'Exams not found' });
            }
            return res.status(200).json(exams);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async updateExam(req, res) {
        try {
            const updatedExam = await ExamService.updateExam(req.body.config);
            if (!updatedExam) {
                return res.status(404).json({ message: 'Exam not found' });
            }
            return res.status(200).json(updatedExam);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async deleteExam(req, res) {
        try {
            const deletedExam = await ExamService.deleteExam(req.body.examId);
            if (!deletedExam) {
                return res.status(404).json({ message: 'Exam not found' });
            }
            return res.status(200).json(deletedExam);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }
}

module.exports = new ExamController();