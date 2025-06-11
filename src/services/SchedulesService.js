const ClassModel = require("../models/ClassModel");
const ScheduleModel = require("../models/ScheduleModel");
const UserService = require("./userService");

const mongoose = require("mongoose");

class SchedulesService {
  // Schedule CRUD operations
  async getSchedules(config) {
    if (!config) throw new Error("Config is required");

    let queryObj = {};
    let user;

    // Xác định user nếu có authId
    if (config.authId) {
      user = await UserService.findByAuthId(config.authId);
    }

    // Xây dựng điều kiện lọc
    switch (config.action) {
      case "getByTeacherId":
        if (!user) throw new Error("User not found");
        queryObj.teacher = user._id;
        break;
      case "getByClassId":
        queryObj.classId = config.classId;
        break;
      case "getByScheduleId":
        queryObj._id = config.scheduleId;
        break;
      case "getByStudentId":
        if (!user) throw new Error("User not found");
        const classData = await ClassModel.findOne({
          students: user._id,
        }).select("_id");
        if (!classData) throw new Error("Class not found for this student");
        queryObj.classId = classData._id;
        break;
      default:
        // Nếu không có action thì lấy tất cả
        break;
    }

    let query = ScheduleModel.find(queryObj).sort({ date: -1 });

    // Hỗ trợ populate động
    if (Array.isArray(config.populates)) {
      config.populates.forEach((populate) => {
        query = query.populate(populate);
      });
    } else {
      // Mặc định populate teacher
      query = query.populate("teacher").populate("classId");
    }

    return await query.exec();
  }

  async createSchedule(config) {
    switch (config.action) {
      case "createSchedule":
        return await ScheduleModel.create(config.scheduleData);
      case "autoCreateSchedule":
        return await this.autoCreateSchedule(config.scheduleData);
      default:
        throw new Error("Invalid action for creating schedule");
    }
  }

  // Auto-generate schedules for a class
  // classId: ID of the class for which to create schedules
  // numberOfShift: number of shifts to be created
  // startDate: date to start creating schedules
  // startTime: start time of the shift
  // endTime: end time of the shift
  async autoCreateSchedule(data) {
    const {
      classId,
      teacher = null,
      room = "Waiting for update",
      numberOfShift,
      startDate,
      startTime,
      endTime,
      scheduleDays,
    } = data;
    const classData = await ClassModel.findById(classId);
    if (!classData) {
      throw new Error("Class not found");
    }

    let scheduleDay = new Date(startDate);
    const schedules = [];
    let createdShift = 0;

    while (createdShift < numberOfShift) {
      // Get day of the week (0-6) and convert to 1-7 (CN = 7)
      let dayOfWeek = scheduleDay.getDay();
      dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // convert CN (0) to 7

      // Check if the current day is in the scheduleDays array
      if (scheduleDays.includes(dayOfWeek)) {
        const schedule = {
          classId: classId,
          teacher: teacher,
          room: room,
          date: new Date(scheduleDay), // store the date of the schedule
          startTime: startTime,
          endTime: endTime,
        };
        schedules.push(schedule);
        createdShift++;
      }

      // Increment the date by one day
      scheduleDay.setDate(scheduleDay.getDate() + 1);
    }

    const createdSchedules = await ScheduleModel.insertMany(schedules);
    return createdSchedules;
  }

  async deleteScheduleByClassId(classId) {
    return await ScheduleModel.deleteMany({ classId });
  }

  async updateSchedules(config) {
    switch (config.action) {
      case "updateSchedule":
        return await this.updateSchedule(
          config.scheduleId,
          config.scheduleData
        );
      case "updateRoom":
        return await this.updateRoomForSchedule(config.scheduleId, config.room);
      case "updateRoomForAll":
        return await this.updateRoomForAllScheduleByClassId(
          config.classId,
          config.room
        );
      case "updateStatus":
        return await this.updateStatusSchedule(
          config.scheduleId,
          config.status
        );
      default:
        throw new Error("Invalid action for updating schedule");
    }
  }

  async updateSchedule(scheduleId, scheduleData) {
    return await ScheduleModel.findByIdAndUpdate(scheduleId, scheduleData, {
      new: true,
      runValidators: true,
    });
  }

  // Update room for all schedules of a class
  async updateRoomForAllScheduleByClassId(classId, room) {
    await ScheduleModel.updateMany(
      { classId },
      { room: room },
      { new: true, runValidators: true }
    );
    return await ScheduleModel.find({ classId });
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

  async deleteSchedule(config) {
    switch (config.action) {
      case "deleteSchedule":
        return await ScheduleModel.findByIdAndDelete(config.scheduleId);
      case "deleteAllSchedules":
        return await this.deleteScheduleByClassId(config.classId);
      default:
        throw new Error("Invalid action for deleting schedule");
    }
  }
}

module.exports = new SchedulesService();
