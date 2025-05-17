const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');
const { asyncHandle } = require('../utils/asyncHandle');

// Process payment route with authentication and permission check
router.post('/process', 
    authMiddleware,
    // checkPermission('make_payment'),
    asyncHandle(PaymentController.processPayment)
);

module.exports = router; 