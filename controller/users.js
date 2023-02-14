const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const config = require('../config');
const pagination = require('./utils/pagination');
const Order = require('../models/Order');

const { secret } = config;
// expresion regular para validar un correo electronico.
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;

const verifyToken = async (tokenUser) => {
  const { authorization } = tokenUser;
  const token = authorization.split(' ')[1];
  // función "jwt.verify" se usa para verificar la autenticidad del token. Recibe dos
  // parámetros: el token y una clave secreta. La clave secreta es usada para firmar y
  // verificar el token.
  const verifyToken = jwt.verify(token, secret);
  return User.findById({ _id: verifyToken.uid });
};

const findUser = async (uid, isEmail) => {
  if (isEmail) {
    return User.findOne({ email: uid });
  }
  return User.findById({ _id: uid });
};

// Función asíncrona que actualiza un usuario en una base de datos.
const updateUser = async (role, type, uid, password, roles) => {
  if (role !== 'admin' && roles) {
    return undefined;
  }
  const encryptedPassword = password
    ? bcrypt.hashSync(password, 10)
    : undefined;
  return User.findOneAndUpdate(
    { [type]: uid },
    { password: encryptedPassword, roles },
    {
      new: true,
    },
  );
};

module.exports = {
  getUsers: async (req, res, next) => {
    // método find() de mongoose devuelve toda la data de una collection.
    const url = `${req.protocol}://${req.get('host')}${req.path}`; // https://127.0.0.1:8888/users
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;
    try {
      // const users = await User.find(); // id prueba error { _uid: '63be4f99954170b25e100f7e' }
      const totalUsers = await User.count(); // cuenta y devuelve un entero.
      const headerPagination = pagination(url, page, limit, totalUsers);
      res.set('link', JSON.stringify(headerPagination));

      const users = await User.find().skip(skip).limit(limit);
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
  updateUserByIdOrEmail: async (req, res) => {
    const { uid } = req.params;
    const { password, roles } = req.body;
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
        if (!password && !roles) {
          return res.status(400).send({
            error: 'Debe proporcionar una contraseña o cambio de rol',
          });
        }
        const type = isEmail ? 'email' : '_id';
        const role = admin ? 'admin' : 'owner';
        const update = await updateUser(role, type, uid, password, roles);
        if (update) {
          res.status(200).send(update);
        } else {
          res
            .status(403)
            .send({ error: 'Solo los admins pueden modificar el rol' });
        }
      } else {
        res
          .status(403)
          .send({ error: 'No tienes permisos de propietario o admin' });
      }
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
  getSalesByUserId: async (req, res, next) => {
    // id { _id: '63be4f99954170b25e100f7e' }
    const { uid } = req.params;
    try {
      const userOrders = await Order.find({ userId: uid }).populate('products.productId');
      if (!userOrders) {
        return res.status(404).send({ error: 'El usuario no tiene Ordenes' });
      }
      res.status(200).send(userOrders);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
};
