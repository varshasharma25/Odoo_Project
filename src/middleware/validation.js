const { body, validationResult } = require('express-validator');

exports.validateRegister = [
  body('employeeId')
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be 3-20 chars'),
  body('email')
    .isEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password: 8+ chars, 1 uppercase, 1 lowercase, 1 number'),
  body('role')
    .isIn(['employee', 'hr'])
    .withMessage('Role must be employee or hr'),
  body('name')
    .isLength({ min: 2 })
    .withMessage('Name required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
