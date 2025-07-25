const CourseService = require("../services/CourseService");
const { ErrorCustom } = require("../core/errorCustom");
const ClassModel = require("../models/ClassModel");
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
      const course = await CourseService.getCourses(req.body.config);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      return res.status(200).json(course);
    } catch (error) {
      throw new ErrorCustom(error.message, 500);
    }
  }

  async getCourseWithFilter(req, res) {
    try {
      console.log(req.body);
      const course = await CourseService.getCourseWithFilter(req.body);
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
  async getOpenClassesByCourseId(req, res) {
    try {
      const { courseId } = req.params;
      // Adjust the query according to your schema (e.g., status: 'open')
      const openClasses = await ClassModel.find({
        course: courseId,
        status: "Incomplete",
      });
      res.status(200).json(openClasses);
    } catch (error) {
      console.error("Error fetching open classes by course ID:", error);
      res.status(500).json({ message: "Failed to fetch open classes" });
    }
  }

  async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const course = await CourseService.getByCourseId(id);
      if (!course) {
        return res.status(404).json({ message: `Course with id ${id} not found` });
      }
      return res.status(200).json({ data: course });
    } catch (error) {
      console.error(`Failed to fetch course by id:`, error);
      return res.status(500).json({ message: "Failed to fetch course", error: error.message });
    }
  }

  async getSpecialCourses(req, res) {
    try {
      const specialCourses = await CourseService.getCourses({ action: "getSpecial" });
      return res.status(200).json({
        success: true,
        data: specialCourses,
        count: specialCourses.length
      });
    } catch (error) {
      console.error("Error fetching special courses:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch special courses", 
        error: error.message 
      });
    }
  }
}

module.exports = new CourseController();
