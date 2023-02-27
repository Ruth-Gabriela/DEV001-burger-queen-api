const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Modelo usuario creado con mongoose.
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: { unique: true },
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      admin: {
        type: Boolean,
        default: false,
      },
      cocina: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true, // createAt updateAt
    versionKey: false,
  },
);

// Función para encriptar el password.
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Creamos un método para comparar el password encriptado con el password entrante
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
