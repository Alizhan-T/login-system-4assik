const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const User = require('./models/User');  // подключаем модель пользователя

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Middleware для обработки JSON данных
app.use(express.json());

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 3600000 }  // 1 час
}));

// Регистрация нового пользователя
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const user = new User({ name, email, password });
        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Вход пользователя
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        req.session.userId = user._id;
        res.status(200).json({ msg: 'Login successful' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Профиль пользователя (защищённый маршрут)
app.get('/api/auth/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(403).json({ msg: 'Forbidden' });
    }

    User.findById(req.session.userId)
        .then(user => res.json({ name: user.name, email: user.email }))
        .catch(() => res.status(500).json({ msg: 'Server error' }));
});

// Основной маршрут
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Запуск сервера
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});