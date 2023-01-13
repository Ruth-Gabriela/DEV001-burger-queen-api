const mongoose = require('mongoose');

// Modelo producto creado con mongoose.
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: false, // createAt updateAt
    versionKey: false,
  },

);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
