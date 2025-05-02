const ClassModel = require('../models/ClassModel');
const ScheduleModel = require('../models/ScheduleModel');

const mongoose = require('mongoose');

class ClassService {
    // Class CRUD operations
    async getClassesInformation(config) {
        let query;
        if (!config) {
            throw new Error('Config is required');
        }
        if (!config.populates) {
            config.populates = [];
        }
        if (!config.style) {
            config.style = "getAll";
        }
        switch (config.style) {
            case "getAll":
                query = ClassModel.find()
                break;
            case "getByClassesId":
                query = ClassModel.findById(config.classId)
                break;
            case "getByCourseId":
                query = ClassModel.find({ courseId: config.courseId })
                break;
            case "getByTeacherId":
                query = ClassModel.find({ teachers: config.teacherId })
                break;
            case "getByStudentId":
                query = ClassModel.find({ students: config.studentId })
                break;
        }
        config.populates.forEach((populate) => {
            switch (populate) {
                case "students":
                    query = query.populate({ path: 'students', model: 'User' })
                    break;
                case "teachers":
                    query = query.populate({ path: 'teachers', model: 'User' })
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

        const classData = await query.exec();
        return classData;
        
    }

    async createClass(classData) {
        return await ClassModel.create(classData);
    }

    async configUpdateClass(config) {
        
        switch (config.style) {
            case "updateClass":
                return await this.updateClass(config.classId, config.classData);
            case "addTeacher":
                return await this.addTeacherToClass(config.classId, config.teacherId);
            case "addStudent":
                return await this.addStudentToClass(config.classId, config.studentId);
        }
    }

    async updateClass(classId, classData) {
        return await ClassModel.findByIdAndUpdate(
        classId,
        classData,
        { new: true, runValidators: true }
        );
    }

    async addTeacherToClass(classId, teacherId) {
        const teacher = await mongoose.model('User').findById(teacherId)
            .populate({
                path: 'authId',
                populate: { path: 'role' }
            });;
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        
        if (teacher.authId.role.name !== 'teacher') {
            throw new Error('User is not a teacher');
        }

        const classData = await ClassModel.findById(classId);

        if (classData.teachers.includes(teacherId)) {
            throw new Error('User is already a teacher of this class');
        }

        return await ClassModel.findByIdAndUpdate(
            classId,
            { $push: { teachers: teacherId } },
            { new: true }
        );
    }        

    async addStudentToClass(classId, studentId) {
        const student = await mongoose.model('User').findById(studentId)
            .populate({
                path: 'authId',
                populate: { path: 'role' }
            })
        
        if (!student) {
            throw new Error('Student not found');
        }

        if (student.authId.role.name !== 'student') {
            throw new Error('User is not a student');
        }

        const classData = await ClassModel.findById(classId);

        if (classData.students.includes(studentId)) {
            throw new Error('User is already a student of this class');
        }

        const quantity = classData.quantity || classData.students.length + 1;
        if (quantity <= classData.students.length) {
            throw new Error('Class is full');
        }
        
        if (classData.status === 'Complete') {
            throw new Error('Class is already complete');
        }

        return await ClassModel.findByIdAndUpdate(
            classId,
            { $push: { students: studentId } },
            { new: true }
        );
    }

    async removeStudentFromClass(classId, studentId) {
        return await ClassModel.findByIdAndUpdate(
        classId,
        { $pull: { students: studentId } },
        { new: true }
        );
    }

    async deleteClass(classId) {
        return await ClassModel.findByIdAndDelete(classId);
    } 
}

module.exports = new ClassService();