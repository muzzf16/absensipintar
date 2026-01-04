const express = require('express');
const router = express.Router();
const { createVisit, getVisits, approveVisit, exportVisitsCSV } = require('../controllers/visitController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, createVisit);
router.get('/', authenticateToken, getVisits);
router.get('/export', authenticateToken, exportVisitsCSV);
router.post('/:id/approve', authenticateToken, approveVisit);
// router.post('/:id/reject', authenticateToken, approveVisit); // Can reuse approve logic with status=rejected

module.exports = router;
