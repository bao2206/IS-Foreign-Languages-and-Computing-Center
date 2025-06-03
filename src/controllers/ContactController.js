const Contact = require('../models/ContactModel');
const UserService = require('../services/userService');
// const { StatusCodes } = require('http-status-codes');
const { sendMailThankYouContact } = require('../services/emailService');
const { BadRequestError, NotFoundError } = require('../core/errorCustom');
const {validateFields} = require('../utils/validators');
class ContactController {
    // Create a new consultation request (public form)
    async createPublicConsultation(req, res) {
        // console.log(req.body)
        const { name, phone, email, consultationContent } = req.body;
        const phoneExist = await UserService.checkPhone(phone);
        const emailExist = await UserService.checkEmail(email);
        
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
        // console.log(req.body)
        let isParent = false;
        const { name, phone, email, consultationContent, status, notes, parent } = req.body;
        
        if (!req.username) {
            return res.status(401).json({
                success: false,
                message: 'Username is required'
            });
        }


        const phoneExist = await UserService.checkPhone(phone);
        const emailExist = await UserService.checkEmail(email);
        
        if (phoneExist) {
            throw new BadRequestError('Phone number already exists');
        }

        if (emailExist) {
            throw new BadRequestError('Email already exists');
        }
        if(isParent){

        }
        const contact = await Contact.create({
            name,
            phone,
            email,
            consultationContent,
            status: status || 'pending',
            notes,
            processedBy: req.username,
            processedAt: Date.now()
        });
        
        res.status(201).json({
            success: true,
            data: contact
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
        const { name, phone, email, courseInterest, consultationContent, notes, status } = req.body;

        const consultation = await Contact.findById(id);

        if (!consultation) {
            throw new NotFoundError(`No consultation found with id ${id}`);
        }

        // Update fields
        consultation.name = name || consultation.name;
        consultation.phone = phone || consultation.phone;
        consultation.email = email || consultation.email;
        consultation.courseInterest = courseInterest || consultation.courseInterest;
        consultation.consultationContent = consultationContent || consultation.consultationContent;
        consultation.notes = notes || consultation.notes;
        consultation.status = status || consultation.status;

        await consultation.save();

        res.status(201).json({
            success: true,
            data: consultation
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
}

module.exports = new ContactController(); 