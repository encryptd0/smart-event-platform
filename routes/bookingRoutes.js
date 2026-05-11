const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { bookingValidation, handleValidation } = require('../middleware/validationMiddleware');

router.post(
  '/:eventId',
  isAuthenticated,
  bookingValidation,
  // Validation failure → bounce back to the event page with a flash so the
  // user keeps context. We use a function so we can reach the event id.
  (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    req.flash('error', errors.array().map((e) => e.msg).join(' • '));
    return res.redirect(`/events/${req.params.eventId}`);
  },
  bookingController.create
);

router.post('/:id/cancel', isAuthenticated, bookingController.cancel);

module.exports = router;
