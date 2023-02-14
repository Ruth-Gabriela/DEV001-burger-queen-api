const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  // console.log(req.headers);
  /* headers {
    page: '1',
    limit: '10',
    authorization: 'Bearer 516516516516',   -> Esto es el token del login
    'user-agent': 'PostmanRuntime/7.29.2',
    'postman-token': 'f2fa00a1-7cad-420c-98c9-840abb679129',
    host: 'localhost:8080',
    'accept-encoding': 'gzip, deflate, br',
    connection: 'keep-alive'
  } */

  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' '); // "Bearer 15f6sa1f651asf651asf5"
  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, async (err, decodedToken) => {
    if (err) {
      return next(403);
    }

    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    // Añadimos a req una nueva propiedad uid con el valor del uid del token
    const id = decodedToken.uid;
    const userExists = await User.findById(id);
    if (!userExists) {
      next(404);
    }
    req.user = userExists;
    next();
  });
};

module.exports.isAuthenticated = (req) => (
  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  !!req.user
);

module.exports.isAdmin = (req) => (
  // TODO: decidir por la informacion del request si la usuaria es admin
  !!req.user.roles.admin
);

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
