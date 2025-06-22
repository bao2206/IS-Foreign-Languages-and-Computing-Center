const Contact = require('../models/ContactModel');
const UserService = require('../services/userService');
const CourseService = require('../services/CourseService');
// const { StatusCodes } = require('http-status-codes');
const { sendMailThankYouContact } = require('../services/emailService');
const { BadRequestError, NotFoundError } = require('../core/errorCustom');

const {validateFields} = require('../utils/validators');

// Helper function for validation and existence checks
async function validateAndCheckExistence({ phone, email, label = "" }) {
    if (phone && email) {
        const validation = validateFields({ phone, email });
        if (!validation.isValid) {
            throw new BadRequestError(validation.errors);
        }
        // Parallelize existence checks
        const [phoneExist, emailExist] = await Promise.all([
            UserService.checkPhone(phone),
            UserService.checkEmail(email)
        ]);
        if (phoneExist) {
            throw new BadRequestError(`${label}Phone number already exists`);
        }
        if (emailExist) {
            throw new BadRequestError(`${label}Email already exists`);
        }
    }
}

class ContactController {
    // Create a new consultation request (public form)
    async createPublicConsultation(req, res) {
        // console.log(req.body)
        const { name, phone, email, consultationContent } = req.body;
        const validation = validateFields({ phone, email});
        if (!validation.isValid) {
          throw new BadRequestError(validation.errors);
        }
        const phoneExist = await UserService.checkPhone(phone);
        const emailExist = await UserService.checkEmail(email);
        console.log("create" ,phoneExist, emailExist)
        if (phoneExist) {
            throw new BadRequestError('Phone number already exists');
        }

        if (emailExist) {
            throw new BadRequestError('Email already exists');
        }
        
        const contact = await Contact.create({
            name,
            phone,
            email,
            consultationContent,
            status: 'pending'
        });
        await sendMailThankYouContact(email, name);
        res.status(201).json({
            success: true,
            data: contact
        });
    }


    async createAdminConsultation(req, res) {
        const { name, phone, email, consultationContent, status, notes, parentName, parentPhone, parentEmail ,assignedCourse } = req.body;
        // console.log(req.body)
        //kiểm tra duplicate nếu có
        await validateAndCheckExistence({ phone, email });
        await validateAndCheckExistence({ phone: parentPhone, email: parentEmail, label: "Parent " });
        // Get course information if assignedCourse is provided
        let courseInfo = null;
        if (assignedCourse) {
            // Use getCourseById for direct lookup
            const course = await CourseService.getCourseById(assignedCourse);
            if (course) {
                courseInfo = {
                    id: course._id,
                    name: course.name
                };
            }
        }

        const contact = await Contact.create({
            name,
            phone,
            email,
            consultationContent,
            status: status || 'pending',
            notes,
            parentName,
            parentPhone,
            parentEmail,
            processedBy: req.username,
            processedAt: Date.now(),
            assignedCourse: assignedCourse || null
        });

        res.status(201).json({
            success: true,
            data: contact,
            courseInfo
        });
    }

    // Get all consultations with filtering and pagination
    async getAllConsultations(req, res) {
        const { status, search, sort, page = 1, limit = 10 } = req.query;
        
        const queryObject = {};
        
        // Add status filter
        if (status && status !== 'all') {
            queryObject.status = status;
        }
        
        // Add search functionality
        if (search) {
            queryObject.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Build sort object
        let sortObject = {};
        if (sort) {
            const sortFields = sort.split(',');
            sortFields.forEach(field => {
                const [key, value] = field.split(':');
                sortObject[key] = value === 'desc' ? -1 : 1;
            });
        } else {
            sortObject = { createdAt: -1 };
        }

        const consultations = await Contact.find(queryObject)
            .sort(sortObject)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('processedBy', 'name email')
            .populate('assignedClass', 'name');

        const total = await Contact.countDocuments(queryObject);

        res.status(200).json({
            success: true,
            data: consultations,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    }

    // Get single consultation
    async getConsultation(req, res) {
        const { id } = req.params;
        
        const consultation = await Contact.findById(id)
            .populate('processedBy', 'name email')
            .populate('assignedClass', 'name');

        if (!consultation) {
            throw new NotFoundError(`No consultation found with id ${id}`);
        }

        res.status(201).json({
            success: true,
            data: consultation
        });
    }

    // Update consultation
    async updateConsultation(req, res) {
        const { id } = req.params;
        const { name, phone, email, assignedCourse, consultationContent, notes, status } = req.body;
        const validation = validateFields({ phone, email});
        if (!validation.isValid) {
          throw new BadRequestError(validation.errors);
        }
        const consultation = await Contact.findById(id);

        if (!consultation) {
            throw new NotFoundError(`No consultation found with id ${id}`);
        }

        // Get course information if assignedCourse is being updated
        let courseInfo = null;
        if (assignedCourse && assignedCourse !== consultation.assignedCourse) {
            const course = await CourseService.getCourses({ action: 'getById', id: assignedCourse });
            if (course) {
                courseInfo = {
                    id: course._id,
                    name: course.name
                };
            }
        }

        // Update fields
        consultation.name = name || consultation.name;
        consultation.phone = phone || consultation.phone;
        consultation.email = email || consultation.email;
        consultation.assignedCourse = assignedCourse || consultation.assignedCourse;
        consultation.consultationContent = consultationContent || consultation.consultationContent;
        consultation.notes = notes || consultation.notes;
        consultation.status = status || consultation.status;

        await consultation.save();

        res.status(201).json({
            success: true,
            data: consultation,
            courseInfo
        });
    }

    // Update consultation status
    async updateStatus(req, res) {
        const { id } = req.params;
        const { status, notes, assignedClass } = req.body;

        const consultation = await Contact.findById(id);

        if (!consultation) {
            throw new NotFoundError(`No consultation found with id ${id}`);
        }

        if (!['pending', 'processed', 'cancelled', 'class_assigned'].includes(status)) {
            throw new BadRequestError('Invalid status value');
        }

        consultation.status = status;
        consultation.notes = notes || consultation.notes;
        consultation.processedBy = req.user.userId;
        consultation.processedAt = Date.now();

        if (status === 'class_assigned' && assignedClass) {
            consultation.assignedClass = assignedClass;
        }

        await consultation.save();

        res.status(201).json({
            success: true,
            data: consultation
        });
    }

    // Delete consultation
    async deleteConsultation(req, res) {
        const { id } = req.params;
        
        const consultation = await Contact.findById(id);

        if (!consultation) {
            throw new NotFoundError(`No consultation found with id ${id}`);
        }

        await consultation.deleteOne();

        res.status(201).json({
            success: true,
            data: {}
        });
    }

    // Get all processed consultations
    async getProcessedConsultations(req, res) {
        const { page = 1, limit = 10, search } = req.query;
        
        const queryObject = { status: 'processed' };
        
        // Add search functionality
        if (search) {
            queryObject.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        const consultations = await Contact.find(queryObject)
            .sort({ processedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('processedBy', 'name email')
            .populate('assignedClass', 'name')
            .populate('assignedCourse', '_id name');
        console.log(consultations)
        const total = await Contact.countDocuments(queryObject);

        res.status(200).json({
            success: true,
            data: consultations,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    }
}

module.exports = new ContactController(); 