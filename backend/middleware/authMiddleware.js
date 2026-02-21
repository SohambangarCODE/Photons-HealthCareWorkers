const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Find or create a default "System" user for the app since auth was removed
    let user = await User.findOne({ email: 'system@healthbridge.ai' });
    
    if (!user) {
      user = await User.create({
        name: 'System Worker',
        email: 'system@healthbridge.ai',
        password: 'mock_password_123', // Will be hashed by model pre-save hook
        role: 'worker'
      });
    }

    // Attach system user to request
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error in mock auth layer' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Always allow in mock mode
    next();
  };
};

module.exports = { protect, authorize };
