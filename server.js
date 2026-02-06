const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const User = require('./models/User');

dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // Для JSON (Postman)
app.use(express.urlencoded({ extended: true })); // Для HTML форм

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 // 1 час
    }
}));

app.use('/api/auth', authRoutes);


app.get('/', (req, res) => res.render('welcome'));

app.get('/register', (req, res) => res.render('register'));

app.get('/login', (req, res) => res.render('login'));

app.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.render('dashboard', { user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));