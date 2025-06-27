const TeacherService = require('../services/TeacherService');

class TeacherController {
    async getAllTeachers(req, res) {
        try {
            const teachers = await TeacherService.getAllTeachers();
            res.status(200).json(teachers);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching teachers', error });
        }
    }

    async getTeacherById(req, res) {
        try {
            const teacher = await TeacherService.getTeacherById(req.params.id);
            if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
            }
            res.status(200).json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching teacher', error });
        }
    }

    async updateTeacherById(req, res) {
        try {
        const updatedTeacher = await TeacherService.updateTeacherById(
            req.params.id,
            req.body
        );
        res.status(200).json(updatedTeacher);
        } catch (error) {
        res.status(500).json({ message: 'Error updating teacher', error });
        }
    }
}

module.exports = new TeacherController();
