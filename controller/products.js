const Product = require('../models/Product');
const pagination = require('./utils/pagination');

const idRegex = /^[a-f\d]{24}$/; // valida si es un ObjectId de MongoDB

const findProduct = async (productId, isId) => {
  if (isId) {
    return Product.findById({ _id: productId });
  }
  return Product.findOne({ name: productId });
};

module.exports = {
  getProducts: async (req, res, next) => {
    // método find() de mongoose devuelve toda la data de una collection.
    const url = `${req.protocol}://${req.get('host')}${req.path}`; // https://127.0.0.1:8888/products
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;
    try {
      const totalProducts = await Product.count(); // cuenta y devuelve un entero.
      const headerPagination = pagination(url, page, limit, totalProducts);
      res.set('link', JSON.stringify(headerPagination));

      const products = await Product.find().skip(skip).limit(limit);
      if (products.length > 0) {
        // eslint-disable-next-line max-len
        res.status(200).send(
          {
            count: totalProducts,
            pages: headerPagination.totalPages,
            prev: headerPagination.links.prev,
            next: headerPagination.links.next,
            first: headerPagination.links.first,
            last: headerPagination.links.last,
            products,
          },
        );
      } else {
        res.status(404).send({ message: 'no hay productos en la DB' });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  getProductByNameOrId: async (req, res, next) => {
    const { productId } = req.params;
    /* Si el valor de productId es igual a "search", la función busca productos en la
    base de datos que coincidan con el valor de la consulta search en el objeto req.
    La búsqueda se realiza usando una expresión regular que hace una coincidencia
    insensible a mayúsculas y minúsculas ($options: 'i'). */
    if (productId === 'search') {
      const { search } = req.query;
      const url = `${req.protocol}://${req.get('host')}${req.path}`;
      const limit = parseInt(req.query.limit, 10) || 10;
      const page = parseInt(req.query.page, 10) || 1;
      const skip = (page - 1) * limit;
      const products = await Product.find({ name: { $regex: search, $options: 'i' } }).skip(skip).limit(limit);
      const totalProducts = await Product.countDocuments({
        name: { $regex: search, $options: 'i' },
      });
      const headerPagination = pagination(url, page, limit, totalProducts);
      if (products.length > 0) {
        // eslint-disable-next-line max-len
        return res.status(200).send(
          {
            count: totalProducts,
            pages: headerPagination.totalPages,
            prev: headerPagination.links.prev,
            next: headerPagination.links.next,
            first: headerPagination.links.first,
            last: headerPagination.links.last,
            products,
          },
        );
      }
      return res.status(404).send({ message: 'No encontramos productos a su busqueda' });
    }
    // inId: el valor productId es un ID o un nombre de producto?
    const isId = idRegex.test(productId);
    try {
      const product = await findProduct(productId, isId);
      if (!product) {
        return res
          .status(404)
          .send({ error: 'No existe el producto en la DB' });
      }
      res.status(200).send(product);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  createProduct: async (req, res, next) => {
    // eslint-disable-next-line object-curly-newline
    const { name, price, image, type } = req.body;
    if (!name || !price) {
      return next(400);
    }
    try {
      const product = await Product.findOne({ name });
      if (product) {
        return res
          .status(403)
          .send({ message: 'El producto ya esta registrado' });
      }
      // Creamos el producto y le pasamos los datos del body
      const newProduct = await Product.create({
        name,
        price,
        image,
        type,
      });
      res.status(200).send(newProduct);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  updateProductByIdOrEmail: async (req, res, next) => {
    const { productId } = req.params;
    const { price } = req.body;
    const isId = idRegex.test(productId);
    try {
      const product = await findProduct(productId, isId);
      if (!product) {
        return res
          .status(404)
          .send({ error: 'No existe el producto en la DB' });
      }
      if (typeof price !== 'number') {
        return next(400);
      }

      const update = await Product.findOneAndUpdate(
        { _id: product._id },
        { price },
        {
          new: true,
        },
      );
      res.status(200).send(update);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  deleteProductByNameOrId: async (req, res, next) => {
    const { productId } = req.params;
    const isId = idRegex.test(productId);
    try {
      const product = await findProduct(productId, isId);
      if (!product) {
        return res
          .status(404)
          .send({ error: 'No existe el producto en la DB' });
      }
      await Product.deleteOne({ _id: product._id });
      res.status(200).send(product);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
