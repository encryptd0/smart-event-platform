const Enquiry = require('../models/Enquiry');

exports.showForm = (req, res) => {
  // Pre-fill name/email if the user is logged in.
  const formData = req.session.user
    ? { name: req.session.user.name, email: req.session.user.email }
    : {};

  res.render('contact/form', {
    title: 'Contact us',
    formData,
    errors: []
  });
};

exports.submit = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    await Enquiry.create({
      name,
      email,
      subject,
      message,
      submittedBy: req.session.user ? req.session.user.id : undefined
    });
    req.flash('success', 'Thanks — your enquiry has been received. We will be in touch.');
    res.redirect('/contact');
  } catch (err) {
    next(err);
  }
};
