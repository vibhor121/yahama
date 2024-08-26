const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const dotenv = require('dotenv');

dotenv.config();
const secretKey = process.env.SECRET_KEY;

// In-memory blacklist for now (can be moved to a database for persistence)
const blackList = new Set();

// Middleware function
const auth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        console.log('Authorization Header in Middleware:', header);

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: 'Authorization header is missing or malformed' });
        }

        const token = header.split(' ')[1];
        console.log('Token:', token);

        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        if (blackList.has(token)) {
            return res.status(403).json({ message: 'This token has been blacklisted' });
        }

        const decoded = jwt.verify(token, secretKey);
        req.user = await userModel.findOne({ email: decoded.email });

        if (!req.user) {
            return res.status(401).json({ message: 'User not found, unauthorized access' });
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else {
            console.error('Error during token verification:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = auth;
