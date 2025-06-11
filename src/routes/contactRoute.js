const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/ContactController');
const {asyncHandle} = require('../utils/asyncHandle');
const getUsernameFromLocalStorage = require('../middlewares/getUsernameFromLocalStorage');

// Public routes
router.post('/public', ContactController.createPublicConsultation);

// Admin routes
// //router.use(authenticateUser);
// router.use(authorizeRoles('admin', 'staff'));

router.post('/admin', getUsernameFromLocalStorage, asyncHandle(ContactController.createAdminConsultation));
// router.get('/', asyncHandle(ContactController.getAllConsultations));
router.get('/', ContactController.getAllConsultations)
router.get('/:id', asyncHandle(ContactController.getConsultation));
router.patch('/:id', asyncHandle(ContactController.updateConsultation));
router.patch('/:id/status', asyncHandle(ContactController.updateStatus));
router.delete('/:id', asyncHandle(ContactController.deleteConsultation));

module.exports = router; 