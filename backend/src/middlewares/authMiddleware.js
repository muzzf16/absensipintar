const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied' });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.warn('JWT_SECRET is not set in environment variables');
        return res.status(500).json({ message: 'Internal server error: Configuration missing' });
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };
