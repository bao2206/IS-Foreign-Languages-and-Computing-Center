const ClassModel = require('../models/ClassModel');
const ScheduleModel = require('../models/ScheduleModel');
const mongoose = require('mongoose');

class ClassService {
    // Class CRUD operations
    async getAllClasses() {
        return await ClassModel.find().populate('students');
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


    async addStudentToClass(classId, studentId) {
        return await ClassModel.findByIdAndUpdate(
        classId,
        { $addToSet: { students: studentId } },
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
        const startDate = new Date(startDate);

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

const ClassServiceInstance = new ClassService();