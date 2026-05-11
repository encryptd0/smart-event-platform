const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contactController');
const { enquiryValidation, handleValidation } = require('../middleware/validationMiddleware');

router.get('/', contactController.showForm);
router.post(
  '/',
  enquiryValidation,
  handleValidation({ view: 'contact/form', title: 'Contact us' }),
  contactController.submit
);

module.exports = router;
