const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, async (req, res) => {
    const { products, totalPrice } = req.body;
    try {
        const order = new Order({
            buyer: req.user._id,
            products,
            totalPrice
        });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to cancel this order' });
        }

        if (order.status !== 'new') {
            return res.status(400).json({ message: 'Only new orders can be canceled' });
        }

        order.status = 'canceled';
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id/complete', protect, async (req, res) => {
    try {
        if (req.user.role !== 'farmer') {
            return res.status(403).json({ message: 'Only farmers can complete orders' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = 'completed';
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;