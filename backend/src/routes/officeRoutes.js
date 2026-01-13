const express = require('express');
const router = express.Router();
const {
    getAllOffices,
    createOffice,
    updateOffice,
    deleteOffice,
    getWorkSchedule,
    updateWorkSchedule
} = require('../controllers/officeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, getAllOffices);
router.post('/', authenticateToken, createOffice);
router.put('/:id', authenticateToken, updateOffice);
router.delete('/:id', authenticateToken, deleteOffice);

// Work Schedule Routes
router.get('/:id/schedule', authenticateToken, getWorkSchedule);
router.put('/:id/schedule', authenticateToken, updateWorkSchedule);

module.exports = router;
