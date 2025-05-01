const CourseService = require('../services/CourseService');
const {ErrorCustom} = require("../core/errorCustom");

class CourseController {
    async createCourse(req, res) {
        try {
            const course = await CourseService.createCourse(req.body);
            return res.status(201).json(course);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async getAllCourses(req, res) {
        try {
            const courses = await CourseService.getAllCourses();
            return res.status(200).json(courses);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async getCourseById(req, res) {
        try {
            const course = await CourseService.getCourseById(req.body.courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            return res.status(200).json(course);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async getSpecialCourse(req, res) {
        try {
            const specialCourses = await CourseService.getSpecialCourse();
            return res.status(200).json(specialCourses);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async updateCourse(req, res) {
        try {
            const course = await CourseService.updateCourse(req.params.id, req.body);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
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
                return res.status(404).json({ message: 'Course not found' });
            }
            return res.status(204).send();
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    // Registration methods

    async getAllRegistrations(req, res) {
        try {
            const registrations = await CourseService.getAllRegistrations();
            return res.status(200).json(registrations);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async getRegistrationById(req, res) {
        try {
            const registration = await CourseService.getRegistrationById(req.params.id);
            if (!registration) {
                return res.status(404).json({ message: 'Registration not found' });
            }
            return res.status(200).json(registration);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async getRegistrationByUserId(req, res) {
        try {
            const registration = await CourseService.getRegistrationByUserId(req.params.id);
            if (!registration) {
                return res.status(404).json({ message: 'Registration not found' });
            }
            return res.status(200).json(registration);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async registerForCourse(req, res) {
        try {
            const registration = await CourseService.registerForCourse(req.body.courseId, req.body.studentId);
            return res.status(201).json(registration);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async changeStatusRegistration(req, res) {
        try {
            const registration = await CourseService.changeStatusRegistration(req.params.id, req.body.status);
            if (!registration) {
                return res.status(404).json({
                    message: 'Registration not found',
                });
            }
        }catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }

    async respondToRegistration(req, res) {
        try {
            const employeeId = req.params.employeeId;
            const idRes = req.body.id;

            // TO-DO: Check if the employeeId is valid and exists in the database
            
            const registration = await CourseService.respondToRegistration(idRes, employeeId, req.body.status);
            if (!registration) {
                throw new ErrorCustom('Registration not found', 404);
            }
            return res.status(200).json(registration);
        } catch (error) {
            throw new ErrorCustom(error.message, 500);
        }
    }
}

module.exports = new CourseController();