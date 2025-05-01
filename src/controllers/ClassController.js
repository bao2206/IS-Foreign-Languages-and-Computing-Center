const ClassService = require('../services/ClassService');
const {ErrorCustom} = require("../core/errorCustom");

class ClassController {
    async createClass(req, res) {
        try {
            const data = req.body.classData;
            const classData = await ClassService.createClass(data);
            return res.status(201).json(classData);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async getAllClasses(req, res) {
        try {
            const classes = await ClassService.getAllClasses();
            return res.status(200).json(classes);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async getClassById(req, res) {
        try {
            const classId = req.body.classId;
            const classData = await ClassService.getClassById(req.body.id);
            if (!classData) {
                return res.status(404).json({ message: 'Class not found' });
            }
            return res.status(200).json(classData);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async updateClass(req, res) {
        try {
            const classId = req.body.classId;
            const classData = req.body.classData;
            const updated = await ClassService.updateClass(req.body.id, classData);
            if (!updated) {
                return res.status(404).json({ message: 'Class not found' });
            }
            return res.status(200).json(updated);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async addTeacherToClass(req, res) {
        try { 
            const classId = req.body.classId;
            const teacherId = req.body.teacherId;
            
            const classData = await ClassService.addTeacherToClass(classId, teacherId);
            if (!classData) {
                return res.status(404).json({ message: 'Class not found' });
            }
            return res.status(200).json(classData);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async addStudentToClass(req, res) {
        try {
            const classId = req.body.classId;
            const studentId = req.body.studentId;
            const classData = await ClassService.addStudentToClass(classId, studentId);
            if (!classData) {
                return res.status(404).json({ message: 'Class not found' });
            }
            return res.status(200).json(classData);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async removeStudentFromClass(req, res) {
        try {
            const classId = req.body.classId;
            const studentId = req.body.studentId;
            const classData = await ClassService.removeStudentFromClass(classId, studentId);
            if (!classData) {
                return res.status(404).json({ message: 'Class not found' });
            }
            return res.status(200).json(classData);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async deleteClass(req, res) {
        try {
            const classId = req.body.classId;
            const classData = await ClassService.deleteClass(classId);
            if (!classData) {
                return res.status(404).json({ message: 'Class not found' });
            }
            return res.status(200).json({ message: 'Class deleted successfully' });
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

}

module.exports = new ClassController();