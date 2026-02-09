const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.playerId = decoded.playerId;
    
    next();
  } catch (err) {
    console.error('认证错误:', err);
    res.status(401).json({ error: '无效的认证令牌' });
  }
};

module.exports = authMiddleware;