const ClassModel = require('../models/ClassModel');
const ScheduleModel = require('../models/ScheduleModel');

const mongoose = require('mongoose');

class ClassService {
    // Class CRUD operations
    async getAllClasses() {
        return await ClassModel.find();
    }

    async getClassById(classId) {
        return await ClassModel.findById(classId).populate('students');
    }

    async createClass(classData) {
        return await ClassModel.create(classData);
    }

    async updateClass(classId, classData) {
        return await ClassModel.findByIdAndUpdate(
        classId,
        classData,
        { new: true, runValidators: true }
        );
    }

    async deleteClass(classId) {
        return await ClassModel.findByIdAndDelete(classId);
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

        if (classData.teacher.includes(teacherId)) {
            throw new Error('User is already a teacher of this class');
        }

        return await ClassModel.findByIdAndUpdate(
            classId,
            { $push: { teacher: teacherId } },
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

    // Schedule CRUD operations
    async getAllSchedules() {
        return await ScheduleModel.find().populate('classId');
    }

    async getScheduleById(scheduleId) {
        return await ScheduleModel.findById(scheduleId).populate('classId');
    }

    async  getScheduleByClassId(classId) {
        return await ScheduleModel.find({ classId }).populate('classId');
    }

    async createSchedule(scheduleData) {
        return await ScheduleModel.create(scheduleData);
    }

    async updateSchedule(scheduleId, scheduleData) {
        return await ScheduleModel.findByIdAndUpdate(
        scheduleId,
        scheduleData,
        { new: true, runValidators: true }
        );
    }

    // Auto-generate schedules for a class
    // classId: ID of the class for which to create schedules
    // numberOfShift: number of shifts to be created
    // startDate: date to start creating schedules
    // startTime: start time of the shift
    // endTime: end time of the shift
    async autoCreateSchedule(classId, numberOfShift, startDate, startTime, endTime) {
        const classData = await ClassModel.findById(classId);
        if (!classData) {
            throw new Error('Class not found');
        }

        const schedules = [];
        for (let i = 0; i < numberOfShift; i++) {
            const scheduleDate = new Date(startDate);
            scheduleDate.setDate(scheduleDate.getDate());

            const schedule = {
                classId: classId,
                room: "Waiting for update",
                date: scheduleDate,
                startTime: startTime,
                endTime: endTime,
            };

            schedules.push(schedule);
        }
        const createdSchedules = await ScheduleModel.insertMany(schedules);
        return createdSchedules;
    }

    async deleteScheduleByClassId(classId) {
        return await ScheduleModel.deleteMany({ classId });
    }

    // Update room for all schedules of a class
    async updateRoomForAllScheduleByClassId(classId, room) {
        return await ScheduleModel.updateMany(
            { classId },
            { room: room },
            { new: true, runValidators: true }
        );
    }

    async updateRoomForSchedule(scheduleId, room) {
        return await ScheduleModel.findByIdAndUpdate(
            scheduleId,
            { room: room },
            { new: true, runValidators: true }
        );
    }

    async updateStatusSchedule(scheduleId, status) {
        return await ScheduleModel.findByIdAndUpdate(
            scheduleId,
            { status: status },
            { new: true, runValidators: true }
        );
    }

    async deleteSchedule(scheduleId) {
        return await ScheduleModel.findByIdAndDelete(scheduleId);
    }

    
}

module.exports = new ClassService();