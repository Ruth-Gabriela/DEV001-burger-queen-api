/* eslint-disable func-names */
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
      default: 'pending',
      enum: ['pending', 'canceled', 'preparing', 'delivering', 'delivered'],
    },
    dateEntry: {
      type: Date,
      required: true,
      // eslint-disable-next-line object-shorthand
      default: function () {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60 * 1000; // Convertir a milisegundos
        return new Date(now.getTime() - timezoneOffset);
      },
    },
    dateProcessed: {
      type: Date,
    },
  },
  {
    timestamps: false, // createAt updateAt
    versionKey: false,
  },
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
