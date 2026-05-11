const User = require('../models/User');

// Build a minimal serialisable user payload for the session.
const sessionPayload = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role
});

exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Log in',
    formData: {},
    errors: []
  });
};

exports.showRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Create an account',
    formData: {},
    errors: []
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).render('auth/register', {
        title: 'Create an account',
        formData: req.body,
        errors: [{ msg: 'An account with that email already exists' }]
      });
    }

    const user = await User.create({ name, email, password });
    // Log the user in automatically on successful registration.
    req.session.user = sessionPayload(user);
    req.flash('success', `Welcome to EventFlow, ${user.name}!`);
    return res.redirect('/dashboard');
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Use the same generic message for both "no user" and "wrong password" to avoid email enumeration.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).render('auth/login', {
        title: 'Log in',
        formData: { email },
        errors: [{ msg: 'Invalid email or password' }]
      });
    }

    req.session.user = sessionPayload(user);
    const target = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    req.flash('success', `Welcome back, ${user.name}.`);
    return res.redirect(target);
  } catch (err) {
    return next(err);
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
};
