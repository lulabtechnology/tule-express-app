const bcrypt = require("bcryptjs");
const { validateLogin } = require("../middlewares/validate");
const adminUserModel = require("../models/adminUser.model");

async function loginForm(req, res) {
  res.render("admin/login", {
    pageTitle: "Admin Login",
    active: "admin",
    form: { identifier: "", password: "" },
    errors: []
  });
}

async function login(req, res) {
  const body = req.body || {};
  const errors = validateLogin(body);
  if (errors.length) {
    return res.status(400).render("admin/login", {
      pageTitle: "Admin Login",
      active: "admin",
      form: body,
      errors
    });
  }

  const identifier = String(body.identifier || "").trim();
  const password = String(body.password || "");

  const admin = await adminUserModel.findByIdentifier(identifier);
  if (!admin || !admin.is_active) {
    return res.status(401).render("admin/login", {
      pageTitle: "Admin Login",
      active: "admin",
      form: { identifier, password: "" },
      errors: ["Credenciales inválidas."]
    });
  }

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) {
    return res.status(401).render("admin/login", {
      pageTitle: "Admin Login",
      active: "admin",
      form: { identifier, password: "" },
      errors: ["Credenciales inválidas."]
    });
  }

  req.session.admin = { id: admin.id, username: admin.username, email: admin.email };
  req.flash("success", "Bienvenido al panel de administración.");
  res.redirect("/admin");
}

async function logout(req, res) {
  req.session.admin = null;
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
}

module.exports = { loginForm, login, logout };
