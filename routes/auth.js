const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const { secret } = config;

/** @module auth */ // => login
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(400);
    }
    // TODO: autenticar a la usuarix
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).send({ error: 'No existe el usuario' });
      }
      const comparePassword = await user.comparePassword(password);
      if (!comparePassword) {
        return res.status(403).send({ error: 'Contraseña Incorrecta' });
      }
      const jwToken = jwt.sign({ uid: user._id }, secret);
      user.password = undefined;
      return res.status(200).send({ user, token: jwToken });
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  });

  return nextMain();
};
