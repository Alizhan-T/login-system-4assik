const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser'); // Не забудь: npm install cookie-parser
const jwt = require('jsonwebtoken');

// Импорт моделей (нужны для отображения страниц)
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

// Импорт роутов API
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();
connectDB();

const app = express();

// === MIDDLEWARE ===
app.use(express.json()); // Читаем JSON
app.use(express.urlencoded({ extended: true })); // Читаем данные форм
app.use(cookieParser()); // Читаем Куки
app.use(express.static('public')); // Раздаем CSS и картинки
app.set('view engine', 'ejs');

// === API ROUTES (Для запросов) ===
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);


// === FRONTEND MIDDLEWARE (Защита страниц) ===
// Эта функция проверяет токен в куках браузера
const protectView = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        console.error('Ошибка токена:', error.message);
        res.clearCookie('token'); // Если токен протух — удаляем
        res.redirect('/login');
    }
};

// === FRONTEND ROUTES (Страницы) ===

// Главная
app.get('/', (req, res) => res.render('welcome'));

// Вход и Регистрация (если уже вошел — кидаем в дешборд)
app.get('/login', (req, res) => {
    if (req.cookies.token) return res.redirect('/dashboard');
    res.render('login');
});
app.get('/register', (req, res) => {
    if (req.cookies.token) return res.redirect('/dashboard');
    res.render('register');
});

// DASHBOARD (Витрина)
app.get('/dashboard', protectView, async (req, res) => {
    try {
        // Загружаем все товары и имя фермера для каждого
        const products = await Product.find().populate('farmer', 'name');
        res.render('dashboard', {
            user: req.user,
            products: products
        });
    } catch (err) {
        res.status(500).send('Ошибка сервера');
    }
});

// КОРЗИНА
app.get('/cart', protectView, (req, res) => {
    res.render('cart', { user: req.user });
});

// ЗАКАЗЫ (История)
app.get('/orders', protectView, async (req, res) => {
    try {
        let orders;
        // Фермер видит все заказы, Покупатель — только свои
        if (req.user.role === 'farmer') {
            orders = await Order.find()
                .populate('buyer', 'name email')
                .sort({ createdAt: -1 });
        } else {
            orders = await Order.find({ buyer: req.user._id })
                .sort({ createdAt: -1 });
        }

        res.render('orders', { user: req.user, orders: orders });
    } catch (err) {
        res.status(500).send('Ошибка при загрузке заказов');
    }
});

// Выход (удаляем куку)
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));