// Authentication & authorization middleware for EventFlow.
// Session shape: req.session.user = { id, name, email, role }

exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) 
    return next();
  req.flash('error', 'Please log in to continue.');
  // Preserve the requested URL so we can redirect back after login.
  req.session.returnTo = req.originalUrl;
  return res.redirect('/auth/login');
};

exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403);
  return res.render('errors/403', {
    title: 'Forbidden',
    message: 'You do not have permission to access this resource.'
  });
};

exports.isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  return next();
};
