const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../middlewares/asyncHandler");
const publicController = require("../controllers/public.controller");
const bookingController = require("../controllers/booking.controller");

router.get("/", asyncHandler(publicController.home));
router.get("/servicios", asyncHandler(publicController.services));
router.get("/reservar", asyncHandler(bookingController.form));
router.post("/reservar", asyncHandler(bookingController.create));
router.get("/reservar/exito/:code", asyncHandler(bookingController.success));

module.exports = router;
