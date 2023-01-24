const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const { secret } = config;

const verifyToken = async (tokenUser) => {
  const { authorization } = tokenUser;
  const token = authorization.split(' ')[1];
  const verifyToken = jwt.verify(token, secret);
  return User.findById({ _id: verifyToken.uid });
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
      res.status(200).send(newUser);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
  getUserByIdOrEmail: async (req, res, next) => {
    // id { _id: '63be4f99954170b25e100f7e' }
    const { uid } = req.params;
    const { authorization } = req.headers;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
    const token = authorization.split(' ')[1];
    try {
      const isEmail = emailRegex.test(uid);
      const verifyToken = jwt.verify(token, secret);
      const tokenUser = await User.findById({ _id: verifyToken.uid });
      if (isEmail) {
        const userByEmail = await User.findOne({ email: uid });
        if (userByEmail) {
          if (tokenUser.roles.admin === true || tokenUser.email === userByEmail.email) {
            res.status(200).send(userByEmail);
          } else {
            res.status(403).send({ error: 'No es propietario o admin' });
          }
        } else {
          res.status(404).send({ error: 'No existe el usuario en la DB' });
        }
      } else {
        const userById = await User.findById({ _id: uid });
        if (userById) {
          if (tokenUser.roles.admin === true || tokenUser._id.equals(userById._id)) {
            res.status(200).send(userById);
          } else {
            res.status(403).send({ error: 'No es propietario' });
          }
        } else {
          res.status(404).send({ error: 'No existe el usuario en la DB' });
        }
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
  deleteUserByIdOrEmail: async (req, res, next) => {
    const { uid } = req.params;
    const { authorization } = req.headers;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
    const token = authorization.split(' ')[1];
    try {
      const isEmail = emailRegex.test(uid);
      const verifyToken = jwt.verify(token, secret);
      const tokenUser = await User.findById({ _id: verifyToken.uid });
      if (isEmail) {
        const deleteUserByEmail = await User.findOne({ email: uid });
        if (deleteUserByEmail) {
          if (tokenUser.roles.admin === true || tokenUser.email === deleteUserByEmail.email) {
            await User.deleteOne({ email: uid });
            res.status(200).send(deleteUserByEmail);
          } else {
            res.status(403).send({ error: 'No tiene permitido eliminar si no es propietario o admin' });
          }
        } else {
          res.status(404).send({ error: 'No existe el usuario solicitado' });
        }
      } else {
        const deleteUserById = await User.findById({ _id: uid });
        if (deleteUserById) {
          if (tokenUser.roles.admin === true || tokenUser._id.equals(deleteUserById._id)) {
            await User.deleteOne({ _id: uid });
            res.status(200).send(deleteUserById);
          } else {
            res.status(403).send({ error: 'No es propietario' });
          }
        } else {
          res.status(404).send({ error: 'No existe el usuario en la DB' });
        }
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
};
