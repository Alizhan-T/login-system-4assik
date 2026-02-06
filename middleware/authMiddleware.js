const protect = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        res.status(401).json({ message: 'Not authorized, please login' });
    }
};

module.exports = { protect };