const PaymentService = require("../services/PaymentService");
const UserService = require("../services/userService");
const AuthService = require("../services/AuthService");
const {
  addNewStudentToClass,
  addStudentToClass,
} = require("../services/ClassService"); // adjust import as needed
const PaymentModel = require("../models/PaymentModel");
const ContactModel = require("../models/ContactModel");
const { createAccount } = require("../utils/userUtils");
// const StudentModel = require("../models/StudentModel");
// const ParentModel = require("../models/ParentModel");
const { generateUsername } = require("../utils/userUtils");
const ClassModel = require("../models/ClassModel");
const UserModel = require("../models/UserModel");
const { sendAccount } = require("../services/emailService");
const qs = require("qs");
const crypto = require("crypto");
const {removeVietnameseTones} = require("../utils/helper")
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
  const payment = await PaymentModel.findById(paymentId);
  if (!payment)
    return {
      status: 404,
      result: { success: false, message: "Payment not found" },
    };

  payment.status = "completed";
  payment.paymentMethod = paymentMethod;
  payment.history.push({
    action: "payment_completed",
    by: req.user && req.user._id ? req.user._id : SYSTEM_USER_ID,
    date: new Date(),
    note: `${
      paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
    } payment completed`,
  });
  await payment.save();
  console.log("PAYMENT", payment);

  // 4. Update student's status in the class to 'paid'
  const classDoc = await ClassModel.findById(payment.class);
  console.log(classDoc);
  if (classDoc) {
    const studentEntry = classDoc.students.find(
      (s) => (s.student && s.student.toString()) === payment.student.toString()
    );
    if (studentEntry) {
      studentEntry.status = "paid";
      await classDoc.save();
    }
  }
  // console.log("StudentEntry", studentEntry)
  const role_student = "6800d06932b289b2fe5b0403";
  const role_parent = "6800d06932b289b2fe5b0406";
  const password = "12345678Abc";
  let studentAuth = null,
    parentAuth = null;

  // Create student Auth account
  if (payment.studentEmail) {
    studentAuth = await AuthService.createAccount(
      generateUsername(payment.studentEmail),
      password,
      role_student
    );
    console.log("Student auth", studentAuth);
    // Assign authId to student user
    const studentUser = await UserModel.findOne({
      email: payment.studentEmail,
    });
    if (studentUser) {
      studentUser.authId = studentAuth._id;
      await studentUser.save();
      // Send email
      await sendAccount(
        studentUser.name,
        studentUser.email,
        studentAuth.username,
        password
      );
    }
  }

  // Create parent Auth account
  if (payment.parentEmail) {
    parentAuth = await AuthService.createAccount(
      generateUsername(payment.parentEmail),
      password,
      role_parent
    );
    // console.log("Parent auth", parentAuth)
    // Assign authId to parent user
    const parentUser = await UserModel.findOne({ email: payment.parentEmail });
    if (parentUser) {
      parentUser.authId = parentAuth._id;
      await parentUser.save();
      // Send email
      await sendAccount(
        parentUser.name,
        parentUser.email,
        parentAuth.username,
        password
      );
    }
  }

  // 8. Return credentials if created
  return {
    status: 200,
    result: {
      success: true,
      message: `Payment completed and accounts created via ${paymentMethod}.`,
      studentAccount: studentAuth || null,
      parentAccount: parentAuth || null,
      studentId: studentAuth ? studentAuth._id : null,
      parentId: parentAuth ? parentAuth._id : null,
    },
  };
}

class PaymentController {
  // Create a new payment (invoice)
  async createPayment(req, res) {
    try {
      const {
        studentId,
        classId,
        courseId,
        parentId,
        paymentDate,
        paymentMethod,
        ...rest
      } = req.body;

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
        ...rest,
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
      const {
        search,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = req.query;

      // Build query object
      const query = {};

      // Search by studentName, courseName, or className (case-insensitive)
      if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [
          { studentName: regex },
          { courseName: regex },
          { className: regex },
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
        PaymentModel.countDocuments(query),
      ]);

      res.status(200).json({
        data: payments,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error fetching financial records:", error);
      res.status(500).json({ message: "Error fetching financial records" });
    }
  }

  // Get a single payment
  async getPaymentById(req, res) {
    const payment = await PaymentService.getPaymentById(req.params.id);
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, data: payment });
  }

  // Update a payment
  async updatePayment(req, res) {
    const payment = await PaymentService.updatePayment(req.params.id, req.body);
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, data: payment });
  }

  // Delete a payment
  async deletePayment(req, res) {
    const payment = await PaymentService.deletePayment(req.params.id);
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, message: "Payment deleted" });
  }

  // Quick update status
  async updatePaymentStatus(req, res) {
    const { status } = req.body;
    const payment = await PaymentService.updatePaymentStatus(
      req.params.id,
      status
    );
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, data: payment });
  }
  async completeCashPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { status, result } = await handlePaymentCompletion({
        paymentId,
        paymentMethod: "cash",
        req,
      });
      res.status(status).json(result);
    } catch (error) {
      console.error("Error in completeCashPayment:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // async createVnpayPayment(req, res) {
  //   try {
  //     const { paymentId, bankCode } = req.body;
  //     const tmnCode = process.env.VNPAY_TMNCODE;
  //     const secretKey = process.env.VNPAY_HASH_SECRET;
  //     const vnpUrl = process.env.VNPAY_URL;
  //     const returnUrl = process.env.VNPAY_RETURN_URL;

  // if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
  //   throw new Error("Missing VNPAY configuration in environment variables.");
  // }

  //     const date = new Date();
  //     const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  //     const payment = await PaymentModel.findById(paymentId);
  //     if (!payment) throw new Error("Cannot find payment");
  //     const rawOrderInfo = `${payment.studentName || ""} ${payment.courseName || ""} ${payment.className || ""}`.trim();
  //   const vnp_OrderInfo = removeVietnameseTones(rawOrderInfo);
  //     let vnp_Params = {
  //       'vnp_Version': '2.1.0',
  //       'vnp_Command': 'pay',
  //       'vnp_TmnCode': tmnCode,
  //       'vnp_Locale': 'vn',
  //       'vnp_CurrCode': 'VND',
  //       'vnp_TxnRef': paymentId,
  //       'vnp_OrderInfo': vnp_OrderInfo,
  //       'vnp_OrderType': 'other',
  //       'vnp_Amount': Math.round(Number(payment.coursePrice) * 100), // Ensure integer
  //       'vnp_ReturnUrl': returnUrl,
  //       'vnp_IpAddr': req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip,
  //       'vnp_CreateDate': createDate,
  //     };
  //     if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

  //     // Sort params by key
  //     vnp_Params = Object.fromEntries(Object.entries(vnp_Params).sort(([a], [b]) => a.localeCompare(b)));

  //     // Build signData string (without encoding values)
  //     const signData = Object.entries(vnp_Params)
  //       .map(([key, value]) => `${key}=${value}`)
  //       .join('&');

  //     // Create secure hash
  //     const hmac = crypto.createHmac('sha512', secretKey);
  //     const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  //     vnp_Params['vnp_SecureHash'] = signed;

  //     // Build payment URL (encode values for URL)
  //     const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;
  //     console.log(paymentUrl)
  //     res.json({ paymentUrl });
  //   } catch (error) {
  //     console.error('VNPAY payment error:', error);
  //     res.status(500).json({ success: false, message: error.message });
  //   }
  // }
  async createVnpayPayment(req, res) {
    const { paymentId } = req.body;
    const tmnCode = process.env.VNPAY_TMNCODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    const vnpUrl = process.env.VNPAY_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;
    const { v4: uuidv4 } = require("uuid");
  
    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      throw new Error("Missing VNPAY configuration in environment variables.");
    }
  
    const {
      VNPay,
      ignoreLogger,
      ProductCode,
      VnpLocale,
      dateFormat,
    } = require("vnpay");

    const vnpay = new VNPay({
      tmnCode,
      secureSecret: secretKey,
      vnpayHost: vnpUrl,
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });
  
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new Error("Cannot find payment");
  
    // Tạo mã giao dịch duy nhất
    const vnp_TxnRef = uuidv4();
    console.log("vnp_TxnRef",vnp_TxnRef)
    // Lưu lại để xử lý callback
    payment.vnpTxnRef = vnp_TxnRef;
    await payment.save();
  
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    const rawOrderInfo = `${payment.studentName || ""} ${payment.courseName || ""} ${payment.className || ""}`.trim();
    const vnp_OrderInfo = removeVietnameseTones(rawOrderInfo);
  
    const vnpayReponse = await vnpay.buildPaymentUrl({
      vnp_Locale: VnpLocale.VN,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_Amount: Math.round(Number(payment.coursePrice)), // nhân 100 theo yêu cầu
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr:
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.ip,
      vnp_TxnRef: vnp_TxnRef,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });
    console.log(vnpayReponse)
    return res.status(201).json(vnpayReponse);
  }
  
  async vnpayReturn(req, res) {
    try {
      const vnp_Params = req.query;
      // console.log("415",req.query)
      if (vnp_Params["vnp_ResponseCode"] === "00") {
        const vnp_TxnRef = vnp_Params["vnp_TxnRef"];
  
        // Tìm hóa đơn tương ứng với mã vnp_TxnRef
        const payment = await PaymentModel.findOne({ vnpTxnRef: vnp_TxnRef });
        if (!payment) {
          return res.status(404).json({ success: false, message: "Payment record not found" });
        }
  
        const { status, result } = await handlePaymentCompletion({
          paymentId: payment._id.toString(), // truyền lại _id thật
          paymentMethod: "VNPAY",
          req,
        });
  
        return res.status(status).json(result);
      } else {
        return res.status(200).json({ success: false, message: "Payment failed", vnp_Params });
      }
    } catch (error) {
      console.error("Error in vnpayReturn:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
}

module.exports = new PaymentController();
