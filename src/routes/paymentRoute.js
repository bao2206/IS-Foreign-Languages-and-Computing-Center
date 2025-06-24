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
router.post("/:paymentId/complete-cash", PaymentController.completeCashPayment);
router.delete("/:id", asyncHandle(PaymentController.deletePayment));
router.patch("/:id/status", asyncHandle(PaymentController.updatePaymentStatus));

module.exports = router;