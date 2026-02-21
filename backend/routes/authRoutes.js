const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Retrieve list of specialists (can be used for dropdowns)
router.get('/specialists', protect, authorize('worker', 'specialist', 'admin'), async (req, res) => {
    try {
        const User = require('../models/User');
        const specialists = await User.find({ role: 'specialist' }).select('-password');
        res.json(specialists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', protect, authorize('admin'), getUsers);

module.exports = router;
