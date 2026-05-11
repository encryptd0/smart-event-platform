const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Atomic booking. Uses a single findOneAndUpdate with a $expr capacity guard so
// concurrent bookings cannot overshoot the capacity (no read-then-write race).
exports.create = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const quantity = parseInt(req.body.quantity, 10);

    const event = await Event.findById(eventId);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/');
    }

    if (event.date.getTime() <= Date.now()) {
      req.flash('error', 'You cannot book a past event.');
      return res.redirect(`/events/${eventId}`);
    }

    // Atomic increment. Filter ensures ticketsBooked + quantity <= capacity.
    const updated = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lte: [{ $add: ['$ticketsBooked', quantity] }, '$capacity'] }
      },
      { $inc: { ticketsBooked: quantity } },
      { new: true }
    );

    if (!updated) {
      const remaining = event.capacity - event.ticketsBooked;
      req.flash(
        'error',
        remaining <= 0
          ? 'This event is sold out.'
          : `Only ${remaining} ticket(s) remaining — please reduce your quantity.`
      );
      return res.redirect(`/events/${eventId}`);
    }

    const totalPrice = quantity * (updated.price || 0);
    await Booking.create({
      user: req.session.user.id,
      event: updated._id,
      quantity,
      totalPrice,
      status: 'confirmed'
    });

    req.flash('success', `Booking confirmed: ${quantity} ticket(s) for "${updated.title}".`);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};

// Cancel a confirmed booking and refund the seats back to the event.
exports.cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) {
      req.flash('error', 'Booking not found.');
      return res.redirect('/dashboard');
    }

    // Authorisation: a user can only cancel their own bookings.
    if (booking.user.toString() !== req.session.user.id) {
      return res.status(403).render('errors/403', {
        title: 'Forbidden',
        message: 'You can only cancel your own bookings.'
      });
    }

    if (booking.status === 'cancelled') {
      req.flash('info', 'That booking is already cancelled.');
      return res.redirect('/dashboard');
    }

    if (booking.event && booking.event.date.getTime() <= Date.now()) {
      req.flash('error', 'You cannot cancel a booking for a past event.');
      return res.redirect('/dashboard');
    }

    booking.status = 'cancelled';
    await booking.save();

    // Return the seats. $inc is atomic.
    await Event.findByIdAndUpdate(booking.event._id, {
      $inc: { ticketsBooked: -booking.quantity }
    });

    req.flash('success', 'Booking cancelled and seats released.');
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};
