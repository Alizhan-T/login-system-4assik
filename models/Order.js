const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: { type: Number, default: 1 },
            title: String,
            price: Number
        }
    ], // <--- Была ошибка здесь (zb]), теперь все чисто
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'completed'],
        default: 'new'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);