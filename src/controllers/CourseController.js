const CourseService = require("../services/CourseService");
const { ErrorCustom } = require("../core/errorCustom");

class CourseController {
  async createCourse(req, res) {
    try {
      const course = await CourseService.createCourse(req.body);
      return res.status(201).json(course);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  async getCourse(req, res) {
    try {
      console.log(req.body);

      const course = await CourseService.getCourses(req.body);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      return res.status(200).json(course);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  async updateCourse(req, res) {
    try {
      console.log(req.body);

      const course = await CourseService.updateCourse(
        req.body._id,
        req.body.data
      );
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      return res.status(200).json(course);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  async deleteCourse(req, res) {
    try {
      const course = await CourseService.deleteCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      return res.status(204).send();
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  // Registration methods

  async getRegistratons(req, res) {
    try {
      const registrations = await CourseService.getRegistrations(
        req.body.config
      );
      if (!registrations) {
        return res.status(404).json({ message: "Registrations not found" });
      }
      return res.status(200).json(registrations);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  async registerForCourse(req, res) {
    try {
      const registration = await CourseService.registerForCourse(
        req.body.courseId,
        req.body.studentId
      );
      return res.status(201).json(registration);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  async updateRegistration(req, res) {
    try {
      const registration = await CourseService.updateRegistration(
        req.body.config
      );
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      return res.status(200).json(registration);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }
}

module.exports = new CourseController();
