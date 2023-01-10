const dotenv = require('dotenv');

dotenv.config();
const express = require('express');
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
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));

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
