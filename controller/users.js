const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const { secret } = config;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;

const verifyToken = async (tokenUser) => {
  const { authorization } = tokenUser;
  const token = authorization.split(' ')[1];
  const verifyToken = jwt.verify(token, secret);
  return User.findById({ _id: verifyToken.uid });
};

const findUser = async (uid, isEmail) => {
  if (isEmail) {
    return User.findOne({ email: uid });
  }
  return User.findById({ _id: uid });
};

module.exports = {
  getUsers: async (req, res, next) => {
    // método find() de mongoose devuelve toda la data de una collection.
    try {
      const users = await User.find(); // id prueba error { _uid: '63be4f99954170b25e100f7e' }
      if (users.length > 0) {
        res.status(200).send(users);
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
      newUser.password = undefined;
      res.status(200).send(newUser);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
  getUserByIdOrEmail: async (req, res, next) => {
    // id { _id: '63be4f99954170b25e100f7e' }
    const { uid } = req.params;
    const tokenUser = await verifyToken(req.headers);
    const isEmail = emailRegex.test(uid);
    try {
      const user = await findUser(uid, isEmail);
      if (!user) {
        return res.status(404).send({ error: 'No existe el usuario en la DB' });
      }
      const admin = tokenUser.roles.admin === true;
      const owner = tokenUser._id.equals(user._id) || tokenUser.email === user.email;
      if (admin || owner) {
        res.status(200).send(user);
      } else {
        res.status(403).send({ error: 'No es propietario o admin' });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
  deleteUserByIdOrEmail: async (req, res, next) => {
    const { uid } = req.params;
    const tokenUser = await verifyToken(req.headers);
    const isEmail = emailRegex.test(uid);
    try {
      const user = await findUser(uid, isEmail);
      if (!user) {
        return res.status(404).send({ error: 'No existe el usuario en la DB' });
      }
      const admin = tokenUser.roles.admin === true;
      const owner = tokenUser._id.equals(user._id) || tokenUser.email === user.email;
      if (admin || owner) {
        await User.deleteOne({ email: uid });
        res.status(200).send(user);
      } else {
        res.status(403).send({ error: 'No es propietario o admin' });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
};
