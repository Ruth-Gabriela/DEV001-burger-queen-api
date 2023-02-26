const mongoose = require('mongoose');

// Modelo producto creado con mongoose.
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    dateEntry: {
      type: Date,
      required: true,
      // eslint-disable-next-line object-shorthand, func-names
      default: function () {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60 * 1000; // Convertir a milisegundos
        return new Date(now.getTime() - timezoneOffset);
      },
    },
  },
  {
    timestamps: false, // createAt updateAt
    versionKey: false,
  },

);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
