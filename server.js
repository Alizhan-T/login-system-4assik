const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

const protectView = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            res.clearCookie('token');
            return res.redirect('/login');
        }

        req.user = user;
        next();
    } catch (error) {
        res.clearCookie('token');
        res.redirect('/login');
    }
};

app.get('/', (req, res) => res.render('welcome'));

app.get('/login', (req, res) => {
    if (req.cookies.token) return res.redirect('/dashboard');
    res.render('login');
});

app.get('/register', (req, res) => {
    if (req.cookies.token) return res.redirect('/dashboard');
    res.render('register');
});

app.get('/dashboard', protectView, async (req, res) => {
    try {
        const products = await Product.find().populate('farmer', 'name');

        let myOrders = [];
        if (req.user.role === 'buyer') {
            myOrders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
        } else if (req.user.role === 'farmer') {
            myOrders = await Order.find().populate('buyer', 'name').sort({ createdAt: -1 });
        }

        res.render('dashboard', {
            user: req.user,
            products: products,
            orders: myOrders
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/cart', protectView, (req, res) => {
    res.render('cart', { user: req.user });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.redirect('/login');
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message || 'Something went wrong!',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));