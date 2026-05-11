// 404 handler — must be registered AFTER all routes.
exports.notFound = (req, res) => {
  res.status(404).render('errors/404', {
    title: 'Page not found',
    url: req.originalUrl
  });
};

// Global error handler. Renders a friendly 500 page and logs the stack server-side.
// In development the stack is shown to the user to help debugging; in production it is hidden.
exports.errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err);

  const status = err.status || 500;
  res.status(status);

  res.render('errors/500', {
    title: 'Something went wrong',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
