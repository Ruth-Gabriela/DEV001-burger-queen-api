const mongoose = require('mongoose');

const connectDB = (url) => {
  try {
    mongoose.set('strictQuery', false);
    mongoose.connect(url, () => {
      console.info('Connected to MongoDB');
    });
  } catch (error) {
    console.info("Can't Connect with MongoDB");
  }
};

module.exports = connectDB;