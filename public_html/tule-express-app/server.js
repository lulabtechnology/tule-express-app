const path = require("path");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");

const { env } = require("./src/config/env");
const { pool, buildSessionStore } = require("./src/config/db");
const { attachCsrf, csrfErrorHandler } = require("./src/middlewares/csrf");
const { attachAdminLocals } = require("./src/middlewares/auth");

const publicRoutes = require("./src/routes/public.routes");
const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require("./src/routes/admin.routes");

const app = express();

// Hostinger suele estar detrás de proxy/reverse proxy
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Views
app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

// Body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));

// Sessions (MySQL store)
const sessionStore = buildSessionStore();

app.use(
  session({
    name: env.SESSION_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production"
    }
  })
);

// Flash
app.use(flash());

// Locals comunes
app.use(async (req, res, next) => {
  res.locals.appUrl = env.APP_URL;
  res.locals.whatsappE164 = env.WHATSAPP_E164;
  res.locals.now = new Date();
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
    info: req.flash("info")
  };
  next();
});

// Admin locals (para navbar)
app.use(attachAdminLocals);

// CSRF (después de session)
app.use(attachCsrf);

// Routes
app.use("/", publicRoutes);
app.use("/", authRoutes);
app.use("/admin", adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("partials/404", {
    pageTitle: "Página no encontrada"
  });
});

// CSRF error handler
app.use(csrfErrorHandler);

// 500
app.use((err, req, res, next) => {
  console.error("[500] Error:", err);
  res.status(500).render("partials/500", {
    pageTitle: "Ocurrió un error",
    errorId: Date.now().toString()
  });
});

// Health check (no DB hard-fail, solo informa)
app.get("/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, db: rows?.[0]?.ok === 1 });
  } catch (e) {
    console.error("[health] DB error:", e.message);
    res.json({ ok: true, db: false });
  }
});

const port = Number(process.env.PORT || env.PORT || 3000);
app.listen(port, () => {
  console.log(`Tule Express app running on port ${port}`);
});
