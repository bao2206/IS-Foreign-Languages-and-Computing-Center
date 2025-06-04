const ShedulesService = require("../services/SchedulesService");
const { ErrorCustom } = require("../core/errorCustom");

class ScheduleController {
  async createSchedule(req, res) {
    try {
      const schedule = await ShedulesService.createSchedule(req.body);
      return res.status(201).json(schedule);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  async getSchedules(req, res) {
    try {
      const schedules = await ShedulesService.getSchedules(req.body);
      if (!schedules) {
        return res.status(404).json({ message: "Schedules not found" });
      }
      return res.status(200).json(schedules);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  async updateSchedule(req, res) {
    try {
      const updatedSchedule = await ShedulesService.updateSchedules(req.body);
      if (!updatedSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      return res.status(200).json(updatedSchedule);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  async deleteSchedule(req, res) {
    try {
      const deletedSchedule = await ShedulesService.deleteSchedule(req.body);
      if (!deletedSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      return res.status(200).json(deletedSchedule);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }
}

module.exports = new ScheduleController();
