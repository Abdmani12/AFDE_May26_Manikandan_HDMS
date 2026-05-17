const jwt = require('jsonwebtoken');
const { getDB } = require('../../database/init');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDB();
    const user = db.prepare('SELECT id, name, email, role, phone, is_active FROM users WHERE id = ?').get(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
