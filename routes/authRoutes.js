const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Валидация
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // Проверка существования
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Ответ
        if (req.accepts('html')) return res.redirect('/login');
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Сохранение сессии
        req.session.userId = user._id;

        if (req.accepts('html')) return res.redirect('/profile');
        res.json({ message: 'Logged in successfully', userId: user._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Could not log out' });

        res.clearCookie('connect.sid');
        if (req.accepts('html')) return res.redirect('/login');
        res.json({ message: 'Logged out successfully' });
    });
});

// GET /api/auth/profile (Защищенный маршрут)
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;