const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');

// Routes a logged-in user to either the user dashboard or the admin analytics view.
exports.index = async (req, res, next) => {
  try {
    if (req.session.user.role === 'admin') {
      return exports.admin(req, res, next);
    }
    return exports.user(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.user = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.session.user.id })
      .populate('event')
      .sort({ bookingDate: -1 })
      .lean();

    const totalQuantity = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const totalPrice = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    res.render('dashboard/userDashboard', {
      title: 'My dashboard',
      bookings,
      totalQuantity,
      totalPrice,
      now: new Date()
    });
  } catch (err) {
    next(err);
  }
};

exports.admin = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      revenueAgg,
      totalEnquiries,
      popularEvents,
      capacityEvents
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      // Sum totalPrice across confirmed bookings.
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Enquiry.countDocuments(),
      // Top 5 events by total ticket count from confirmed bookings.
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        {
          $group: {
            _id: '$event',
            totalTickets: { $sum: '$quantity' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { totalTickets: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'events',
            localField: '_id',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$event' },
        {
          $project: {
            _id: 0,
            eventId: '$event._id',
            title: '$event.title',
            category: '$event.category',
            date: '$event.date',
            totalTickets: 1,
            bookings: 1
          }
        }
      ]),
      Event.find().sort({ date: 1 }).lean({ virtuals: true })
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.render('dashboard/adminDashboard', {
      title: 'Admin dashboard',
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue,
        totalEnquiries
      },
      popularEvents,
      capacityEvents
    });
  } catch (err) {
    next(err);
  }
};
