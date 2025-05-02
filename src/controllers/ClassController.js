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


    // Requires a config object with the following properties:
    // - style: "getAll", "getByClassesId", "getByCourseId", "getByTeacherId"
    // - populates: an array of strings indicating which fields to populate as "students", "teachers", "course", or "All"
    // - classId: the ID of the class to retrieve (if style is "getByClassesId")
    // - courseId: the ID of the course to retrieve (if style is "getByCourseId")
    // - teacherId: the ID of the teacher to retrieve (if style is "getByTeacherId")
    // Example:
    // {
    //     "config": {
    //         "style": "getAll",
    //         "populates": [
    //             "course",
    //             "teachers"
    //         ]
    //     }
    // }
    async getClassInformation(req, res) {
        try {
            const config = req.body.config;
            const classData = await ClassService.getClassesInformation(config);
            if (!classData) {
                return res.status(404).json({ message: 'Class not found' });
            }
            
            return res.status(200).json(classData);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    // Requires a config object with the following properties:

    // Example:
    // {
    //     "config": {
    //         "style": "addStudent",
    //         "classId": "6814502829b9dc01713b0b94",
    //         "studentId": "68033539631c5c16fbcc2f61"
    //     }
    // }

    async updateClass(req, res) {
        try {
            const config = req.body.config;
            const classData = await ClassService.configUpdateClass(config);
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
            const classData = await ClassService.deleteClass(req.body.classId);
            if (!classData) {
                return res.status(404).json({ message: 'Class not found' });
            }
            return res.status(200).json(classData);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

}

module.exports = new ClassController();