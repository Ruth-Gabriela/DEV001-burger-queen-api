const dotenv = require('dotenv');

dotenv.config();
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');
const connectDB = require('./database');

const { port, dbUrl, secret } = config;
const app = express();

// TODO: Conexión a la Base de Datos (MongoDB o MySQL)
connectDB(dbUrl); // llamamos a la función que conecta con nuestra base de datos en Mongo DB Atlas

app.set('config', config); // añadimos propiedades a app.
app.set('pkg', pkg);

// parse application/x-www-form-urlencoded --middleware.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use(authMiddleware(secret));

// Agregar el encabezado Access-Control-Allow-Origin
// eslint-disable-next-line prefer-arrow-callback
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Registrar rutas
routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);
  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
});
