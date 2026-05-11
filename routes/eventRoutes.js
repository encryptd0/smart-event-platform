const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

router.get('/', eventController.listPublic);
router.get('/:id', eventController.showDetails);

module.exports = router;
