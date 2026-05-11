// Session-backed flash messages — drop-in replacement for `connect-flash`.
// connect-flash@0.1.1 is unmaintained and uses Node's deprecated util.isArray API,
// so we provide the same `req.flash(type[, message])` interface here.

module.exports = function flash() {
  return function (req, res, next) {
    if (!req.session) {
      return next(new Error('flash middleware requires sessions — mount session middleware first'));
    }

    if (typeof req.flash === 'function') return next();

    req.flash = function (type, message) {
      const store = (req.session.flash = req.session.flash || {});

      // Read mode: `req.flash('error')` → returns and clears all messages of that type.
      if (message === undefined) {
        if (type === undefined) {
          const all = store;
          req.session.flash = {};
          return all;
        }
        const messages = store[type] || [];
        delete store[type];
        return messages;
      }

      // Write mode: `req.flash('error', 'oops')` → push a message.
      const bucket = (store[type] = store[type] || []);
      if (Array.isArray(message)) {
        bucket.push(...message);
      } else {
        bucket.push(message);
      }
      return bucket.length;
    };

    next();
  };
};
