const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
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
  getOrders: async (req, res, next) => {
    try {
      const orders = await Order.find();
      if (orders.length > 0) {
        res.status(200).send(orders);
      } else {
        res.status(404).send({ message: 'No existen ordenes en la BD' });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  createOrder: async (req, res, next) => {
    // eslint-disable-next-line object-curly-newline
    const user = await verifyToken(req.headers);
    const userTokenId = user._id;
    const { userId, client, status, products } = req.body;
    if (!products || products.length === 0) {
      return next(400);
    }
    try {
      // Creamos el producto y le pasamos los datos del body
      const newOrder = new Order({
        userId: userId || userTokenId,
        client,
        products,
        status,
      });
      await newOrder.save();
      const newOrderWithPopulate = await Order.findById({
        _id: newOrder._id,
      }).populate('products.productId');
      const response = {
        ...newOrderWithPopulate._doc,
        products: newOrderWithPopulate.products.map((p) => ({
          qty: p.qty,
          product: {
            ...p.productId._doc,
            name:
            p.productId.name.charAt(0).toUpperCase()
            + p.productId.name.slice(1),
          },
        })),
      };
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
