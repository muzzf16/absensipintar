const express = require('express');
const router = express.Router();
const { login, register, logout } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register); // Helper endpoint for creating users
router.post('/logout', logout);

module.exports = router;
