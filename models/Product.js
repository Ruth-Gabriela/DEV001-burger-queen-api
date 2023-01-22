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
      default: Date.now(),
    },
  },
  {
    timestamps: false, // createAt updateAt
    versionKey: false,
  },

);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
