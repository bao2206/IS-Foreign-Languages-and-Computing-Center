const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/ContactController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');
const permissions = require('../middlewares/permission');
const {asyncHandle} = require('../utils/asyncHandle')
// Public routes
router.post('/public', asyncHandle(ContactController.createPublicConsultation));

// Admin routes
router.use(authMiddleware);
router.use(checkPermission(permissions.MANAGE_CLASSES)); // Assuming this permission is appropriate for managing consultations

router.post('/admin', asyncHandle(ContactController.createAdminConsultation));
router.get('/', asyncHandle(ContactController.getAllConsultations));
router.get('/:id', asyncHandle(ContactController.getConsultation));
router.patch('/:id', asyncHandle(ContactController.updateConsultation));
router.patch('/:id/status', asyncHandle(ContactController.updateStatus));
router.delete('/:id', asyncHandle(ContactController.deleteConsultation));

module.exports = router; 