const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            // ВАЖНОЕ ИСПРАВЛЕНИЕ: Если токен валиден, но пользователя нет в базе
            if (!req.user) {
                return res.status(401).json({ message: 'Пользователь не найден. Выйдите и войдите снова.' });
            }

            next();
        } catch (error) {
            console.error('Ошибка авторизации:', error.message);
            res.status(401).json({ message: 'Не авторизован, токен неверный' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Не авторизован, нет токена' });
    }
};

module.exports = { protect };