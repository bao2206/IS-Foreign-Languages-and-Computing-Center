const PaymentService = require('../services/PaymentService');
const { ErrorCustom, BadRequestError, NotFoundError, UnauthorizedError } = require("../core/errorCustom");

class PaymentController {
    async processPayment(req, res) {
        const { courseId, userId, studentId, coursePrice, method, discountCode } = req.body;

        // Validate required fields
        if (!courseId || !userId || !studentId || !coursePrice || !method) {
            throw new BadRequestError("Missing required fields: courseId, userId, studentId, coursePrice, method");
        }

        // Validate price is positive number
        if (coursePrice <= 0) {
            throw new BadRequestError("Course price must be greater than 0");
        }

        // Validate payment method
        const validMethods = ["VNPAY", "MOMO", "cash"];
        if (!validMethods.includes(method)) {
            throw new BadRequestError("Invalid payment method. Must be one of: VNPAY, MOMO, cash");
        }

        // Find and validate course
        const course = await PaymentService.findCourse(courseId);
        if (!course) {
            throw new NotFoundError("Course not found");
        }
        if (course.price !== coursePrice) {
            throw new BadRequestError("Course price does not match");
        }

        // Find and validate user (parent or student)
        const user = await PaymentService.findUser(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Find and validate student
        const student = await PaymentService.findStudent(studentId);
        if (!student) {
            throw new NotFoundError("Student not found");
        }

        // If the user is a parent, verify they are the student's parent
        if (user.role === 'parent') {
            const isParentOfStudent = await PaymentService.checkStudentBelongsToParent(userId, student._id);
            if (!isParentOfStudent) {
                throw new UnauthorizedError("You are not authorized to make payments for this student");
            }
        } else if (user.role !== 'student' || userId !== studentId) {
            // If not a parent, user must be the student themselves
            throw new UnauthorizedError("You are not authorized to make this payment");
        }

        let finalAmount = coursePrice;
        let discountId = null;

        // Process discount if provided
        if (discountCode) {
            const discount = await PaymentService.findDiscount(discountCode);
            if (!discount) {
                throw new BadRequestError("Invalid or inactive discount code");
            }

            // Validate based on discount type
            if (discount.discountType === "promotion") {
                const isValid = await PaymentService.checkPromotionValidity(discount, coursePrice);
                if (!isValid) {
                    throw new BadRequestError("Promotion discount is not valid for this purchase");
                }
                await PaymentService.updatePromotionUsage(discount);
            } else {
                // For returning_student and relative discounts, check against student's status
                const studentUser = await PaymentService.findUser(studentId);
                if (!studentUser) {
                    throw new NotFoundError("Student user not found");
                }

                if (discount.discountType === "returning_student" && studentUser.type !== "returning_student") {
                    throw new BadRequestError("This discount is only for returning students");
                }
                if (discount.discountType === "relative" && studentUser.type !== "relative") {
                    throw new BadRequestError("This discount is only for relatives of students");
                }
            }

            // Calculate final amount
            finalAmount = PaymentService.calculateDiscountedAmount(coursePrice, discount.discountPercentage);
            discountId = discount._id;
        }

        // Create payment record
        const payment = await PaymentService.createPayment({
            userId,         // This will be parent's ID if parent is paying
            studentId,      // This identifies the student the payment is for
            courseId,
            coursePrice,
            finalAmount,
            method,
            discountId,
            courseName: course.coursename
        });

        return res.status(201).json({
            success: true,
            message: "Payment initiated successfully",
            data: payment
        });
    }
}

module.exports = new PaymentController(); 