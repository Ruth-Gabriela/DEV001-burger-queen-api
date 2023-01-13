const User = require('../models/User');

module.exports = {
  getUsers: async (req, res, next) => {
    // método find() de mongoose devuelve toda la data de una collection.
    try {
      const users = await User.find(); // id prueba error { _id: '63be4f99954170b25e100f7e' }
      if (users.length > 0) {
        res.status(200).send({ users });
      } else {
        res.status(404).send({ message: 'no hay usuarios en la DB' });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
