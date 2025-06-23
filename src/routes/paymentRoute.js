const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");
const { asyncHandle } = require("../utils/asyncHandle");
const ContactModel = require("../models/ContactModel");
// const { SYSTEM_USER_ID } = require("../config/config");

router.post("/", asyncHandle(PaymentController.createPayment));
router.get("/", asyncHandle(PaymentController.getAllPayments));
router.get("/:id", asyncHandle(PaymentController.getPaymentById));
router.put("/:id", asyncHandle(PaymentController.updatePayment));
// router.post("/payments/:paymentId/complete-cash", async (req, res) => {
//   const { paymentId } = req.params;
//   const { paymentMethod } = req.body;

//   try {
//     const payment = await PaymentController.getPaymentById(req);
//     if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

//     const contact = await ContactModel.findById(payment.contactStudent);
//     if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });

//     payment.status = "completed";
//     payment.paymentMethod = paymentMethod;
//     payment.history.push({
//       action: "payment_completed",
//       by: req.user && req.user._id ? req.user._id : SYSTEM_USER_ID,
//       date: new Date(),
//       note: `${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} payment completed`
//     });
//     await payment.save();

//     return res.status(200).json({ success: true, message: "Payment completed successfully" });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: "An error occurred", error: error.message });
//   }
// });
router.delete("/:id", asyncHandle(PaymentController.deletePayment));
router.patch("/:id/status", asyncHandle(PaymentController.updatePaymentStatus));

module.exports = router;