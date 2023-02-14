require('dotenv').config();

exports.port = process.env.PORT;
exports.dbUrl = process.env.MONGO_URI;
exports.secret = process.env.JWT_SECRET;
exports.adminEmail = process.env.ADMIN_EMAIL;
exports.adminPassword = process.env.ADMIN_PASSWORD;
exports.dbName = process.env.DB_NAME;
