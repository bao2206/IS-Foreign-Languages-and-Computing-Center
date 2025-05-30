const Contact = require('../models/ContactModel');
const UserService = require('../services/userService');
// const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../core/errorCustom');

class ContactController {
    // Create a new consultation request (public form)
    async createPublicConsultation(req, res) {
        const { name, phone, email, courseInterest, consultationContent } = req.body;
        // const [phoneExist , emailExist]= await Promise.all([
        //     AuthService.findByPhone(phone),
        //     AuthService.findByEmail(email)
        // ]);
        console.log(phone)
        console.log(email)
        const phoneExist = await UserService.checkPhone(phone);
        const emailExist = await UserService.checkEmail(email);
        console.log(phoneExist)
        console.log(emailExist)
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
            courseInterest,
            consultationContent,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: contact
        });
    }

    // Create a new consultation request (admin panel)
    async createAdminConsultation(req, res) {
        const { name, phone, email, courseInterest, consultationContent, status, notes } = req.body;
        
        if (!req.username) {
            return res.status(401).json({
                success: false,
                message: 'Username is required'
            });
        }

        // Check if phone or email already exists
        const [phoneExist , emailExist]= await Promise.all([
            UserService.checkPhone(phone),
            UserService.checkEmail(email)
        ]);
        // console.log(emailExist)
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
            courseInterest,
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

        res.status(StatusCodes.OK).json({
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

        res.status(StatusCodes.OK).json({
            success: true,
            data: consultation
        });
    }

    // Update consultation
    async updateConsultation(req, res) {
        const { id } = req.params;
        const { name, phone, email, courseInterest, consultationContent, notes } = req.body;

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

        await consultation.save();

        res.status(StatusCodes.OK).json({
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

        res.status(StatusCodes.OK).json({
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

        res.status(StatusCodes.OK).json({
            success: true,
            data: {}
        });
    }
}

module.exports = new ContactController(); 