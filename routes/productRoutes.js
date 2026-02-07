const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// Получение всех товаров
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('farmer', 'name email');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Добавление товара (Только для фермеров)
router.post('/', protect, async (req, res) => {
    // Дополнительная проверка, чтобы сервер не падал
    if (!req.user) {
        return res.status(401).json({ message: 'Пользователь не определен' });
    }

    if (req.user.role !== 'farmer') {
        return res.status(403).json({ message: 'Только фермеры могут добавлять товары' });
    }

    const { title, description, price, category } = req.body;

    try {
        const product = new Product({
            title,
            description,
            price,
            category,
            farmer: req.user._id
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (err) {
        console.error(err); // Логируем ошибку в консоль сервера
        res.status(400).json({ message: 'Ошибка при сохранении: ' + err.message });
    }
});

// Удаление товара
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        // Проверка прав (удалить может только владелец)
        if (product.farmer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Нет прав на удаление этого товара' });
        }

        await Product.deleteOne({ _id: req.params.id });
        res.json({ message: 'Товар удален' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;