const mongoose = require('mongoose');

const connectDB = async (dbUrl) => {
  try {
    console.info(url);
    mongoose.set('strictQuery', false);
    await mongoose.connect(dbUrl).then(() => console.info('Connected with MongoDB'))
      .catch((e) => console.info(e));
  } catch (error) {
    console.info("Can't Connect with MongoDB");
  }
};

module.exports = connectDB;
