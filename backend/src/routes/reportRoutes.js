const express = require('express');
const router = express.Router();

router.get('/csv', (req, res) => res.json({ message: 'Export CSV endpoint' }));
router.get('/pdf', (req, res) => res.json({ message: 'Export PDF endpoint' }));

module.exports = router;
