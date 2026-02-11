const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../middlewares/asyncHandler");
const { loginLimiter } = require("../middlewares/rateLimit");
const authController = require("../controllers/auth.controller");

router.get("/admin/login", asyncHandler(authController.loginForm));
router.post("/admin/login", loginLimiter, asyncHandler(authController.login));
router.post("/admin/logout", asyncHandler(authController.logout));

module.exports = router;
