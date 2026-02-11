function attachAdminLocals(req, res, next) {
  res.locals.admin = req.session?.admin || null;
  res.locals.isAdmin = Boolean(req.session?.admin?.id);
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.admin?.id) {
    req.flash("error", "Debes iniciar sesión para continuar.");
    return res.redirect("/admin/login");
  }
  next();
}

module.exports = { attachAdminLocals, requireAdmin };
