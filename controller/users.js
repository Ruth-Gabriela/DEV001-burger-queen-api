const User = require('../models/User');

module.exports = {
  getUsers: async (req, res, next) => {
    // método find() de mongoose devuelve toda la data de una collection.
    try {
      const users = await User.find(); // id prueba error { _id: '63be4f99954170b25e100f7e' }
      if (users.length > 0) {
        res.status(200).send({ users });
      } else {
        res.status(404).send({ error: 'No hay usuarios en la DB' });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
  createUser: async (req, res, next) => {
    const { email, password, roles } = req.body;
    if (!email || !password) {
      return next(400);
    }
    try {
      const user = await User.findOne({ email });
      if (user) {
        return res.status(403).send({ error: 'El email ya tiene un usuario registrado' });
      }
      // Creamos el Usuario y le pasamos los datos del body
      const newUser = await User.create({ email, password, roles });
      res.status(203).send(newUser);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
};
