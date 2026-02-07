const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Генерация токена (действует 30 дней)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ... тут код регистрации ...

// === ПОЛНЫЙ КОД ЛОГИНА ===
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Ищем пользователя по email
        const user = await User.findOne({ email });

        // 2. Проверяем пароль
        if (user && (await bcrypt.compare(password, user.password))) {

            // 3. Если всё ок — отдаем данные и ТОКЕН
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id), // <--- Самое важное
            });
        } else {
            res.status(401).json({ message: 'Неверный email или пароль' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;