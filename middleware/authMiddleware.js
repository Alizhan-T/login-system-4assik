const protect = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        // Если запрос от браузера (HTML), редирект на логин
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        // Иначе (Postman/API) возвращаем ошибку JSON
        res.status(401).json({ message: 'Not authorized, please login' });
    }
};

module.exports = { protect };