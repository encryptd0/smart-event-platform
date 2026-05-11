const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const { eventValidation, handleValidation } = require('../middleware/validationMiddleware');

// Every admin route requires authentication AND admin role.
router.use(isAuthenticated, isAdmin);

// ───── Event management ─────
router.get('/events', eventController.adminList);
router.get('/events/new', eventController.showCreateForm);

router.post(
  '/events',
  eventValidation,
  handleValidation((req) => ({
    view: 'events/form',
    title: 'Create event',
    locals: { mode: 'create', action: '/admin/events', method: 'POST' }
  })),
  eventController.create
);

router.get('/events/:id/edit', eventController.showEditForm);

router.put(
  '/events/:id',
  eventValidation,
  handleValidation((req) => ({
    view: 'events/form',
    title: 'Edit event',
    locals: {
      mode: 'edit',
      action: `/admin/events/${req.params.id}?_method=PUT`,
      method: 'POST'
    }
  })),
  eventController.update
);

router.delete('/events/:id', eventController.remove);

// ───── Enquiry management ─────
router.get('/enquiries', adminController.listEnquiries);
router.put('/enquiries/:id/status', adminController.updateEnquiryStatus);
router.delete('/enquiries/:id', adminController.deleteEnquiry);

module.exports = router;
