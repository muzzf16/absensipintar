const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/upload', authenticateToken, upload.single('file'), billingController.uploadBilling);
router.get('/', authenticateToken, billingController.getActiveBillings);

module.exports = router;
