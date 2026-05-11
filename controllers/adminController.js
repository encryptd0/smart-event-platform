const Enquiry = require('../models/Enquiry');

const VALID_STATUSES = ['new', 'read', 'resolved'];

exports.listEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.render('contact/manage', {
      title: 'Manage enquiries',
      enquiries
    });
  } catch (err) {
    next(err);
  }
};

exports.updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      req.flash('error', 'Invalid status value.');
      return res.redirect('/admin/enquiries');
    }

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!enquiry) {
      req.flash('error', 'Enquiry not found.');
    } else {
      req.flash('success', `Enquiry status updated to "${status}".`);
    }
    res.redirect('/admin/enquiries');
  } catch (err) {
    next(err);
  }
};

exports.deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      req.flash('error', 'Enquiry not found.');
    } else {
      req.flash('success', 'Enquiry deleted.');
    }
    res.redirect('/admin/enquiries');
  } catch (err) {
    next(err);
  }
};
