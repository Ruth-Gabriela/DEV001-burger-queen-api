const Product = require('../models/Product');

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
    try {
      const products = await Product.find(); // id prueba error { _id: '63be4f99954170b25e100f7e' }
      // console.log(products)
      if (products.length > 0) {
        res.status(200).send(products);
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
      const searchByName = await Product.find({ name: { $regex: search, $options: 'i' } });
      return res.status(200).send(searchByName);
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
