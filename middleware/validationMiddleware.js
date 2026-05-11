const { body, param, query, validationResult } = require('express-validator');

// Centralised express-validator chains. Controllers attach these to routes,
// then call `handleValidation` to render-back-with-errors or proceed.

exports.registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

exports.loginValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

exports.eventValidation = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category')
    .isIn(['Conference', 'Workshop', 'Festival', 'Private', 'Other'])
    .withMessage('Invalid category'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date')
    .custom((value, { req }) => {
      // Future-date check only on creation.
      if (req.method === 'POST' && new Date(value).getTime() <= Date.now()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('imageUrl').optional({ checkFalsy: true }).isURL().withMessage('Image URL must be a valid URL')
];

exports.bookingValidation = [
  param('eventId').isMongoId().withMessage('Invalid event id'),
  body('quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20')
];

exports.enquiryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
];

// Helper that flash-shows errors and re-renders, OR continues. Each controller
// passes the view name and the data needed to re-render the form with input.
exports.handleValidation = (renderConfig) => (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  // Allow callers to pass a function that returns config based on req, or a static config.
  const cfg = typeof renderConfig === 'function' ? renderConfig(req, res) : renderConfig;
  const locals = Object.assign(
    {
      title: cfg.title || 'Form errors',
      errors: errors.array(),
      formData: req.body
    },
    cfg.locals || {}
  );

  res.status(422);
  return res.render(cfg.view, locals);
};
