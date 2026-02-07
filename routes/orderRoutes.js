const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// Создание заказа (без изменений, код выше)
router.post('/', protect, async (req, res) => {
    // ... (ваш старый код создания заказа) ...
    // ВАЖНО: Убедитесь, что тут используется правильный расчет цены, как мы обсуждали ранее
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

// === НОВЫЕ РОУТЫ ===

// 1. Отмена заказа (для Покупателя)
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Заказ не найден' });

        // Проверяем, что это заказ текущего пользователя
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Нельзя отменить чужой заказ' });
        }

        if (order.status !== 'new') {
            return res.status(400).json({ message: 'Можно отменить только новый заказ' });
        }

        order.status = 'canceled';
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Смена статуса на "Выполнено" (для Фермера)
router.put('/:id/complete', protect, async (req, res) => {
    try {
        // Проверка на фермера
        if (req.user.role !== 'farmer') {
            return res.status(403).json({ message: 'Только фермер может завершать заказы' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Заказ не найден' });

        order.status = 'completed';
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;