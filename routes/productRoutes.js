const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
// ВАЖНО: Добавляем checkRole в импорт
const { protect, checkRole } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('farmer', 'name');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', protect, checkRole('farmer'), async (req, res) => {
    const { title, description, price, category, imageUrl } = req.body;

    try {
        const product = await Product.create({
            title,
            description,
            price,
            category,
            imageUrl: imageUrl || 'https://placehold.co/600x400?text=No+Image',
            farmer: req.user._id
        });

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error creating product' });
    }
});

router.delete('/:id', protect, checkRole('farmer'), async (req, res) => {
    try {
        await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
        res.json({ message: 'Product removed' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;