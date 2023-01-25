const mongoose = require('mongoose');

// Modelo Órdenes creado con mongoose.
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    client: {
      type: String,
      trim: true,
    },
    products: [
      {
        qty: {
          type: Number,
          required: true,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'canceled', 'delivering', 'delivered'],
    },
    dateEntry: {
      type: Date,
      required: true,
      default: Date.now(),
    },
  },
  {
    timestamps: false, // createAt updateAt
    versionKey: false,
  },
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
