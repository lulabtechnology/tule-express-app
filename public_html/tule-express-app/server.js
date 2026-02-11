const path = require("path");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");

const { env } = require("./src/config/env");
const { pool, createSessionStore } = require("./src/config/db");
const { attachCsrf, csrfErrorHandler } = require("./src/middlewares/csrf");
const { attachAdminLocals } = require("./src/middlewares/auth");

const publicRoutes = require("./src/routes/public.routes");
const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require("./src/routes/admin.routes");

const app = express();

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

// Sessions (MySQL store; fallback si falla para evitar 503)
let sessionStore = null;
try {
  sessionStore = createSessionStore();
  console.log("[session] Using MySQL session store");
} catch (e) {
  console.error("[session] MySQL session store failed, using MemoryStore:", e.message);
}

app.use(
  session({
    name: env.SESSION_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore || undefined,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production"
    }
  })
);

app.use(flash());

// Locals
app.use((req, res, next) => {
  res.locals.appUrl = env.APP_URL;
  res.locals.whatsappE164 = env.WHATSAPP_E164;
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
    info: req.flash("info")
  };
  next();
});

app.use(attachAdminLocals);
app.use(attachCsrf);

// Health check
app.get("/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, db: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.json({ ok: true, db: false, error: e.message });
  }
});

// Routes
app.use("/", publicRoutes);
app.use("/", authRoutes);
app.use("/admin", adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("partials/404", { pageTitle: "Página no encontrada" });
});

// CSRF handler
app.use(csrfErrorHandler);

// 500
app.use((err, req, res, next) => {
  console.error("[500] Error:", err);
  res.status(500).render("partials/500", {
    pageTitle: "Ocurrió un error",
    errorId: Date.now().toString()
  });
});

const port = Number(process.env.PORT || env.PORT || 3000);
app.listen(port, () => console.log(`Tule Express app running on port ${port}`));
