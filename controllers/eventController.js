const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Build a Mongo filter from query string params used by the public event listing.
const buildListingFilter = (q) => {
  const filter = {};

  if (q.search && q.search.trim()) {
    // Escape regex specials so user input cannot accidentally form regex.
    const safe = q.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(safe, 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }

  if (q.category && q.category !== 'all') {
    filter.category = q.category;
  }

  // Date range filtering. Default: only show upcoming events.
  const now = new Date();
  if (q.dateRange === 'week') {
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    filter.date = { $gte: now, $lte: weekFromNow };
  } else if (q.dateRange === 'month') {
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    filter.date = { $gte: now, $lte: monthFromNow };
  } else {
    filter.date = { $gte: now };
  }

  return filter;
};

exports.listPublic = async (req, res, next) => {
  try {
    const filter = buildListingFilter(req.query);
    let events = await Event.find(filter).sort({ date: 1 }).lean({ virtuals: true });

    // Availability filter post-query — uses the virtual which isn't queryable directly.
    if (req.query.availability === 'available') {
      events = events.filter((e) => e.ticketsBooked < e.capacity);
    } else if (req.query.availability === 'soldout') {
      events = events.filter((e) => e.ticketsBooked >= e.capacity);
    }

    res.render('home', {
      title: 'Discover events',
      events,
      filters: {
        search: req.query.search || '',
        category: req.query.category || 'all',
        dateRange: req.query.dateRange || 'all',
        availability: req.query.availability || 'all'
      },
      categories: ['Conference', 'Workshop', 'Festival', 'Private', 'Other']
    });
  } catch (err) {
    next(err);
  }
};

exports.showDetails = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).lean({ virtuals: true });
    if (!event) {
      return res.status(404).render('errors/404', {
        title: 'Event not found',
        url: req.originalUrl
      });
    }
    res.render('events/details', {
      title: event.title,
      event
    });
  } catch (err) {
    // CastError on bad id → treat as 404.
    if (err.name === 'CastError') {
      return res.status(404).render('errors/404', {
        title: 'Event not found',
        url: req.originalUrl
      });
    }
    next(err);
  }
};

// ───── Admin CRUD ─────

exports.adminList = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean({ virtuals: true });
    res.render('events/manage', {
      title: 'Manage events',
      events,
      mode: 'list',
      formData: {},
      errors: []
    });
  } catch (err) {
    next(err);
  }
};

exports.showCreateForm = (req, res) => {
  res.render('events/form', {
    title: 'Create event',
    mode: 'create',
    formData: {},
    errors: [],
    action: '/admin/events',
    method: 'POST'
  });
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, category, date, location, capacity, price, imageUrl } = req.body;
    const event = await Event.create({
      title,
      description,
      category,
      date,
      location,
      capacity,
      price,
      imageUrl: imageUrl || undefined,
      createdBy: req.session.user.id
    });
    req.flash('success', `Event "${event.title}" created.`);
    res.redirect('/admin/events');
  } catch (err) {
    next(err);
  }
};

exports.showEditForm = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/admin/events');
    }
    res.render('events/form', {
      title: `Edit: ${event.title}`,
      mode: 'edit',
      formData: event,
      errors: [],
      action: `/admin/events/${event._id}?_method=PUT`,
      method: 'POST'
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, description, category, date, location, capacity, price, imageUrl } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/admin/events');
    }

    Object.assign(event, {
      title,
      description,
      category,
      date,
      location,
      capacity,
      price,
      imageUrl: imageUrl || event.imageUrl
    });
    await event.save();
    req.flash('success', `Event "${event.title}" updated.`);
    res.redirect('/admin/events');
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/admin/events');
    }

    // Decision: BLOCK deletion if there are confirmed bookings (safer than cascade).
    const activeBookings = await Booking.countDocuments({
      event: event._id,
      status: 'confirmed'
    });
    if (activeBookings > 0) {
      req.flash(
        'error',
        `Cannot delete "${event.title}" — it has ${activeBookings} active booking(s). Cancel those first.`
      );
      return res.redirect('/admin/events');
    }

    await event.deleteOne();
    // Clean up any cancelled-booking history attached to the event.
    await Booking.deleteMany({ event: event._id });
    req.flash('success', `Event "${event.title}" deleted.`);
    res.redirect('/admin/events');
  } catch (err) {
    next(err);
  }
};
