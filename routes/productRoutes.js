const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
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
// @desc    Получить один товар по ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('farmer', 'name');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Товар не найден' });
        }
    } catch (err) {
        // Если ID невалидный (неправильный формат ObjectId)
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Товар не найден' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.put('/:id', protect, checkRole('farmer'), async (req, res) => {
    const { title, description, price, category, imageUrl } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.farmer.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'You cannot update product' });
            }

            product.title = title || product.title;
            product.description = description || product.description;
            product.price = price || product.price;
            product.category = category || product.category;
            product.imageUrl = imageUrl || product.imageUrl;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

module.exports = router;