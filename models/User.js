const mongoose = require('mongoose');

// Modelo usuario creado con mongoose.
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    roles: {
      admin: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: false, // createAt updateAt
    versionKey: false,
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
