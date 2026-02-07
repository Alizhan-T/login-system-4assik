const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('farmer', 'name email');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'farmer') {
        return res.status(403).json({ message: 'Only farmers can add products' });
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
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.farmer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this product' });
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;