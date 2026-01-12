const express = require('express');
const router = express.Router();
const { getAllOffices, createOffice, updateOffice, deleteOffice } = require('../controllers/officeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, getAllOffices);
router.post('/', authenticateToken, createOffice);
router.put('/:id', authenticateToken, updateOffice);
router.delete('/:id', authenticateToken, deleteOffice);

module.exports = router;
