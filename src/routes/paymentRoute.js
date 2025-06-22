const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");
const { asyncHandle } = require("../utils/asyncHandle");

router.post("/", asyncHandle(PaymentController.createPayment));
router.get("/", asyncHandle(PaymentController.getAllPayments));
router.get("/:id", asyncHandle(PaymentController.getPaymentById));
router.put("/:id", asyncHandle(PaymentController.updatePayment));
router.post("/payments/:paymentId/complete-cash", PaymentController.completeCashPayment);
router.delete("/:id", asyncHandle(PaymentController.deletePayment));
router.patch("/:id/status", asyncHandle(PaymentController.updatePaymentStatus));

module.exports = router;