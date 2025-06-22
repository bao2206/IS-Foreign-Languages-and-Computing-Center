const PaymentService = require("../services/PaymentService");
const UserService = require("../services/userService");
const AuthService = require("../services/AuthService");
const { addNewStudentToClass, addStudentToClass } = require("../services/ClassService"); // adjust import as needed
const PaymentModel = require("../models/PaymentModel")
const ContactModel = require("../models/ContactModel")
const {createAccount} = require("../utils/userUtils")
const StudentModel = require("../models/StudentModel");
const ParentModel = require("../models/ParentModel");
const { sendAccount } = require("../services/emailService");
// const UserModel = require("../models/UserModel")

const SYSTEM_USER_ID = "000000000000000000000000"; // Replace with a real ObjectId if you have a system user

// Helper to create user and account if email is present
async function createUserAndAccount({ name, email, phone, roleId }) {
  if (!email) return { user: null, account: null, credentials: null };
  const credentials = await createAccount(email);
  const user = await UserService.createNewStaff({ name, email, phone });
  const account = await AuthService.createAccount(credentials, roleId);
  user.authId = account._id;
  await user.save();
  return { user, account, credentials };
}

// Reusable handler for payment completion logic
async function handlePaymentCompletion({ paymentId, paymentMethod, req }) {
  // 1. Update payment status and method
  const payment = await PaymentModel.findById(paymentId);
  if (!payment) return { status: 404, result: { success: false, message: "Payment not found" } };

  payment.status = "completed";
  payment.paymentMethod = paymentMethod;
  payment.history.push({
    action: "payment_completed",
    by: req.user && req.user._id ? req.user._id : SYSTEM_USER_ID,
    date: new Date(),
    note: `${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} payment completed`
  });
  await payment.save();

  // 2. Get contact info
  const contact = await ContactModel.findById(payment.contactStudent);
  if (!contact) return { status: 404, result: { success: false, message: "Contact not found" } };

  // 3. Create student and parent accounts in parallel if needed
  const role_student = "6800d06932b289b2fe5b0403";
  const role_parent = "6800d06932b289b2fe5b0406";

  const [studentResult, parentResult] = await Promise.all([
    createUserAndAccount({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      roleId: role_student
    }),
    contact.parentEmail ? createUserAndAccount({
      name: contact.parentName || `Parent of ${contact.name}`,
      email: contact.parentEmail,
      phone: contact.parentPhone,
      roleId: role_parent
    }) : Promise.resolve({ user: null, account: null, credentials: null })
  ]);

  // 4. Associate users with StudentModel and ParentModel
  let studentDoc = null;
  let parentDoc = null;
  if (studentResult.user) {
    // Find or create StudentModel entry
    studentDoc = await StudentModel.findOne({ userId: studentResult.user._id });
    if (!studentDoc) {
      studentDoc = await StudentModel.create({ userId: studentResult.user._id });
    } else {
      studentDoc.userId = studentResult.user._id;
      await studentDoc.save();
    }
  }
  if (parentResult.user) {
    // Find or create ParentModel entry
    parentDoc = await ParentModel.findOne({ userId: parentResult.user._id });
    if (!parentDoc) {
      parentDoc = await ParentModel.create({ userId: parentResult.user._id, phone: contact.parentPhone });
    } else {
      parentDoc.userId = parentResult.user._id;
      await parentDoc.save();
    }
    // Add student to parent's students array if not already present
    if (studentDoc && !parentDoc.students.includes(studentDoc._id)) {
      parentDoc.students.push(studentDoc._id);
      await parentDoc.save();
    }
    // Also, update studentDoc's parentId if not set
    if (studentDoc && !studentDoc.parentId) {
      studentDoc.parentId = parentDoc._id;
      await studentDoc.save();
    }
  }

  // 5. Send account info via email if created
  if (studentResult.credentials && contact.email) {
    await sendAccount(contact.name, contact.email, studentResult.credentials.username, studentResult.credentials.password);
  }
  if (parentResult.credentials && contact.parentEmail) {
    await sendAccount(contact.parentName || `Phụ huynh của ${contact.name}`, contact.parentEmail, parentResult.credentials.username, parentResult.credentials.password);
  }

  // 6. Return credentials if created
  return {
    status: 200,
    result: {
      success: true,
      message: `Payment completed and accounts created via ${paymentMethod}.`,
      studentAccount: studentResult.credentials || null,
      parentAccount: parentResult.credentials || null,
      studentId: studentDoc ? studentDoc._id : null,
      parentId: parentDoc ? parentDoc._id : null
    }
  };
}

class PaymentController {
  // Create a new payment (invoice)
  async createPayment(req, res) {
    try {
      const { studentId, classId, courseId, parentId, paymentDate, paymentMethod, ...rest } = req.body;

      // 1. Add new student to class (if needed)
      await addNewStudentToClass(studentId, classId);

      // 2. Add student to class (if needed)
      await addStudentToClass(classId, studentId);

      // 3. Prepare payment data
      const paymentData = {
        student: studentId,
        class: classId,
        course: courseId,
        parent: parentId || null,
        paymentDate,
        paymentMethod,
        ...rest
      };

      const payment = await PaymentService.createPayment(paymentData);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all payments
  async getAllPayments(req, res) {
    try {
      const { search, status, startDate, endDate, page = 1, limit = 10 } = req.query;
  
      // Build query object
      const query = {};
  
      // Search by studentName, courseName, or className (case-insensitive)
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [
          { studentName: regex },
          { courseName: regex },
          { className: regex }
        ];
      }
  
      // Filter by status
      if (status) {
        query.status = status;
      }
  
      // Filter by paymentDate range
      if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) query.paymentDate.$gte = new Date(startDate);
        if (endDate) query.paymentDate.$lte = new Date(endDate);
      }
  
      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      // Query payments
      const [payments, total] = await Promise.all([
        PaymentModel.find(query)
          .sort({ paymentDate: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        PaymentModel.countDocuments(query)
      ]);
  
      res.status(200).json({
        data: payments,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error("Error fetching financial records:", error);
      res.status(500).json({ message: "Error fetching financial records" });
    }
  }

  // Get a single payment
  async getPaymentById(req, res) {
    const payment = await PaymentService.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, data: payment });
  }

  // Update a payment
  async updatePayment(req, res) {
    const payment = await PaymentService.updatePayment(req.params.id, req.body);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, data: payment });
  }

  // Delete a payment
  async deletePayment(req, res) {
    const payment = await PaymentService.deletePayment(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, message: "Payment deleted" });
  }

  // Quick update status
  async updatePaymentStatus(req, res) {
    const { status } = req.body;
    const payment = await PaymentService.updatePaymentStatus(req.params.id, status);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, data: payment });
  }
  async completeCashPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { status, result } = await handlePaymentCompletion({ paymentId, paymentMethod: "cash", req });
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PaymentController();