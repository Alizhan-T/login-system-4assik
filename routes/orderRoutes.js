const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, async (req, res) => {
    const { products, totalPrice } = req.body;

    if (!products || products.length === 0) {
        return res.status(400).json({ message: 'Корзина пуста' });
    }

    try {
        const order = new Order({
            buyer: req.user._id,
            products: products,
            totalPrice: totalPrice
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        let orders;

        if (req.user.role === 'farmer') {
            orders = await Order.find()
                .populate('buyer', 'name email')
                .sort({ createdAt: -1 }); // Сначала новые
        } else {
            orders = await Order.find({ buyer: req.user._id })
                .sort({ createdAt: -1 });
        }

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;