const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getHistory, getAllAttendance, getStats, exportCSV } = require('../controllers/attendanceController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/checkin', authenticateToken, checkIn);
router.post('/checkout', authenticateToken, checkOut);
router.get('/history', authenticateToken, getHistory);
router.get('/all', authenticateToken, getAllAttendance); // Admin only in real app
router.get('/stats', authenticateToken, getStats); // Admin only in real app
router.get('/export-csv', authenticateToken, exportCSV); // Admin export

module.exports = router;
