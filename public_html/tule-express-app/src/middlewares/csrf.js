const csurf = require("csurf");

// CSRF usando session
const csrfProtection = csurf();

function attachCsrf(req, res, next) {
  // Excluir endpoints que no requieren CSRF
  if (req.path === "/health") return next();

  return csrfProtection(req, res, function (err) {
    if (err) return next(err);
    res.locals._csrf = req.csrfToken();
    next();
  });
}

function csrfErrorHandler(err, req, res, next) {
  if (err && err.code === "EBADCSRFTOKEN") {
    req.flash("error", "Token de seguridad expirado. Intenta nuevamente.");
    return res.redirect(req.headers.referer || "/");
  }
  next(err);
}

module.exports = { attachCsrf, csrfErrorHandler };
