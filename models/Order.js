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
      required: true,
      trim: true,
    },
    products: [
      {
        qty: {
          type: Number,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      },
    ],
    status: {
      type: String,
      required: true,
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
