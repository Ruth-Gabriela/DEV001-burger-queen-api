const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');
const config = require('../config');
const pagination = require('./utils/pagination');

const { secret } = config;

// Función que verifica el jwt
const verifyToken = async (tokenUser) => {
  const { authorization } = tokenUser;
  const token = authorization.split(' ')[1];
  const verifyToken = jwt.verify(token, secret);
  return User.findById({ _id: verifyToken.uid });
};

module.exports = {
  getOrders: async (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}${req.path}`; // https://127.0.0.1:8888/products
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;
    try {
      const totalOrders = await Order.count(); // cuenta y devuelve un entero.
      const headerPagination = pagination(url, page, limit, totalOrders);
      res.set('link', JSON.stringify(headerPagination));

      const orders = await Order.find().skip(skip).limit(limit);
      if (orders.length > 0) {
        res.status(200).send(orders);
      } else {
        res.status(404).send({ message: 'No existen ordenes en la DB' });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  createOrder: async (req, res, next) => {
    // eslint-disable-next-line object-curly-newline
    const user = await verifyToken(req.headers);
    const userTokenId = user._id;
    const {
      userId, client, status, products,
    } = req.body;
    if (!products || products.length === 0) {
      return next(400);
    }
    try {
      // Creamos el producto, le pasamos los datos del body y guardamos
      const newOrder = new Order({
        userId: userId || userTokenId,
        client,
        products,
        status,
      });
      await newOrder.save();
      // metodo populate() devuelve los campos establecidos de la referencia
      const newOrderWithPopulate = await Order.findById({
        _id: newOrder._id,
      }).populate('products.productId');
      // cambiamos de productId a product
      // ponemos en mayúscula el primer caracter de productId.name
      const newOrderWithDetails = {
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
      res.status(200).send(newOrderWithDetails);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  getOrderById: async (req, res, next) => {
    const { orderId } = req.params;
    try {
      const order = await Order.findById({ _id: orderId }).populate('products.productId');
      if (!order) {
        return res
          .status(404)
          .send({ error: 'No existe la orden en la DB' });
      }
      const orderWithDetails = {
        ...order._doc,
        products: order.products.map((p) => ({
          qty: p.qty,
          product: {
            ...p.productId._doc,
            name:
            p.productId.name.charAt(0).toUpperCase()
            + p.productId.name.slice(1),
          },
        })),
      };
      res.status(200).send(orderWithDetails);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  updateOrderById: async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const dateProcessed = status === 'delivered' ? Date.now() : undefined;
    const validStatus = ['pending', 'canceled', 'preparing', 'delivering', 'delivered'];
    try {
      const order = await Order.findById({ _id: orderId });
      if (!order) {
        return res
          .status(404)
          .send({ error: 'No existe la orden en la DB' });
      }
      if (!status) {
        return next(400);
      }
      if (!validStatus.includes(status)) {
        return res
          .status(400)
          .send({ error: 'Valor del status es incorrecto' });
      }
      const update = await Order.findOneAndUpdate(
        { _id: orderId },
        { status, dateProcessed },
        {
          new: true,
        },
      );
      res.status(200).send(update);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  deleteOrderById: async (req, res, next) => {
    const { orderId } = req.params;
    try {
      const order = await Order.findById({ _id: orderId });
      if (!order) {
        return res
          .status(404)
          .send({ error: 'No existe la orden en la DB' });
      }
      await Order.deleteOne({ _id: orderId });
      res.status(200).send(order);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
