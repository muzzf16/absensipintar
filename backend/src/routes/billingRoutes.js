const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { authenticateToken } = require('../middlewares/authMiddleware');

// Upload billing data
router.post('/upload', authenticateToken, upload.single('file'), billingController.uploadBilling);

// Get billings
router.get('/', authenticateToken, billingController.getActiveBillings);      // Unpaid only
router.get('/paid', authenticateToken, billingController.getPaidBillings);    // Paid only
router.get('/all', authenticateToken, billingController.getAllBillings);      // All billings

// Payment management
router.put('/:id/pay', authenticateToken, billingController.markAsPaid);      // Mark as paid
router.put('/:id/unpay', authenticateToken, billingController.markAsUnpaid);  // Revert payment

module.exports = router;
