const { validationResult } = require('express-validator');
const { body, param } = require('express-validator');

const validation = (req, res, next) => {
  const errorFormatter = ({ msg, param }) => ({ [param]: msg });
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const bodyPostUserValidator = [
  body('email')
    .normalizeEmail()
    .notEmpty()
    .withMessage('El parámetro email está vacio')
    .isEmail()
    .withMessage('El formato del email es incorrecto'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('El parámetro password está vacio')
    .isLength({ min: 4 })
    .withMessage('Es requerido al menos 5 caracteres en el password'),
  validation,
];

const paramOrderId = [
  param('orderId')
    .trim()
    .notEmpty()
    .escape()
    .matches(/^[a-f\d]{24}$/, 'i')
    .withMessage('Formato de ID Incorrecto'),
  validation,
];

module.exports = { validation, bodyPostUserValidator, paramOrderId };
