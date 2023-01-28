const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.info();
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.DB_URL, () => {
      console.info('Connected to MongoDB');
    });
  } catch (error) {
    console.info("Can't Connect with MongoDB");
  }
};

module.exports = connectDB;
