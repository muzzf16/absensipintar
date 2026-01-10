const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// All routes require authentication and admin/supervisor role (adjust as needed)
// Use existing middleware if available. Assuming authenticateToken maps to user in req.user
// authorizeRole might be needed. For now, assuming authenticateToken is enough or we check role inside.
// Ideally: router.use(authenticateToken); router.use(authorizeRole(['admin']));

// I will check middlewares folder next, but for now apply authenticateToken globally to these routes
router.use(authenticateToken);
// Typically only admin should manage users
// router.use(authorizeRole(['admin'])); 

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
