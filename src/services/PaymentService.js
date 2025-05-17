const PaymentModel = require('../models/PaymentModel');
const CourseModel = require('../models/CourseModel');
const DiscountModel = require('../models/DiscountModel');
const UserModel = require('../models/UserModel');
const ParentModel = require('../models/ParentModel');
const StudentModel = require('../models/StudentModel');

class PaymentService {
    async findCourse(courseId) {
        return await CourseModel.findById(courseId);
    }

    async findDiscount(code) {
        return await DiscountModel.findOne({
            code,
            isActive: "active"
        });
    }

    async findUser(userId) {
        return await UserModel.findById(userId);
    }

    async findParentWithStudents(parentId) {
        return await ParentModel.findOne({ userId: parentId })
            .populate('students')
            .populate({
                path: 'students',
                populate: {
                    path: 'userId',
                    model: 'User'
                }
            });
    }

    async findStudent(studentId) {
        return await StudentModel.findOne({ userId: studentId });
    }

    async checkStudentBelongsToParent(parentId, studentId) {
        const parent = await ParentModel.findOne({ userId: parentId });
        if (!parent) return false;
        return parent.students.includes(studentId);
    }

    async checkPromotionValidity(discount, coursePrice) {
        const now = new Date();
        const isDateValid = now >= new Date(discount.start_date) && now <= new Date(discount.end_date);
        const hasRemaining = discount.remaining > 0;
        const isPriceValid = coursePrice >= discount.minimum_order_value && 
            (discount.maximum_order_value === 0 || coursePrice <= discount.maximum_order_value);

        return isDateValid && hasRemaining && isPriceValid;
    }

    calculateDiscountedAmount(coursePrice, discountPercentage) {
        const discountAmount = (coursePrice * discountPercentage) / 100;
        return coursePrice - discountAmount;
    }

    async updatePromotionUsage(discount) {
        if (discount.discountType !== "promotion") return;

        discount.used_count += 1;
        discount.remaining -= 1;
        if (discount.remaining <= 0) {
            discount.isActive = "inactive";
        }
        return await discount.save();
    }

    async createPayment(paymentData) {
        const { 
            userId,         // This will be parent's ID if parent is paying
            studentId,      // This is required to know which student the payment is for
            courseId, 
            coursePrice, 
            finalAmount, 
            method, 
            discountId, 
            courseName 
        } = paymentData;

        return await PaymentModel.create({
            userId,
            studentId,      // Adding studentId to payment record
            courseId,
            coursePrice,
            finalAmount,
            amount: finalAmount,
            method,
            discount_code: discountId,
            status: "pending",
            history: [{
                action: "payment_initiated",
                by: userId,
                note: `Payment initiated for student ${studentId} for course ${courseName}`
            }]
        });
    }
}

module.exports = new PaymentService(); 