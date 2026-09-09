import jwt from 'jsonwebtoken';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      userType: decoded.userType,
      isMember: decoded.isMember || false,
      memberId: decoded.memberId || null,
      cooperative_id: decoded.cooperative_id || null,
      family_id: decoded.family_id || null
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

export const isAdmin = roleCheck('admin');
export const isLeader = roleCheck('leader', 'admin');
export const isFamilyLeader = roleCheck('family_leader', 'admin');
export const isAnyLeader = roleCheck('leader', 'family_leader', 'admin');
export const isMember = roleCheck('member', 'leader', 'family_leader', 'admin');

// Backward compatibility
export const authenticate = auth;
export const authorize = roleCheck;