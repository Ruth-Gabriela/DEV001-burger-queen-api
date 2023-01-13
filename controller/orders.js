const Order = require('../models/Order.js');

module.exports = {
  getOrders: async (req, res, next) => {
    try {
      const orders = await Order.find();
      if (orders.length > 0) {
        res.status(200).send({ orders });
      } else {
        res.status(404).send({ message: 'No existen ordenes en la BD' });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
