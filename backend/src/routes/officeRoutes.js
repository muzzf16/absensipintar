const express = require('express');
const router = express.Router();
const { getAllOffices, createOffice, updateOffice, deleteOffice } = require('../controllers/officeController');

router.get('/', getAllOffices);
router.post('/', createOffice);
router.put('/:id', updateOffice);
router.delete('/:id', deleteOffice);

module.exports = router;
