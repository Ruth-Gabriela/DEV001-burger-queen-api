const mongoose = require('mongoose');

const connectDB = async (url) => {
  try {
    console.info();
    mongoose.set('strictQuery', false);
    await mongoose.connect(url).then(() => console.info('Connected with MongoDB'))
      .catch((e) => console.info(e));
  } catch (error) {
    console.info("Can't Connect with MongoDB");
  }
};

module.exports = connectDB;
