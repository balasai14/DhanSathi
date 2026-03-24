const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header or Cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) throw new Error('Not logged in. Access denied.');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_finova');
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) throw new Error('User no longer exists.');

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: err.message });
  }
};
