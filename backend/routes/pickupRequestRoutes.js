const express = require("express");

const router = express.Router();

const {
  createPickupRequest,
  getAllPickupRequests,
  getPickupRequestById,
  updatePickupRequest,
  deletePickupRequest,
} = require("../controllers/pickupRequestController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

const { validate } = require("../middleware/validationMiddleware");

const {
  validatePickupRequest,
} = require("../validators/pickupRequestValidator");

router.post(
  "/",
  protect,
  authorizeRoles("NGO"),
  validate(validatePickupRequest),
  createPickupRequest,
);

router.get("/", protect, getAllPickupRequests);

router.get("/:request_id", protect, getPickupRequestById);

router.put(
  "/:request_id",
  protect,
  authorizeRoles("Donor", "NGO"),
  updatePickupRequest,
);

router.delete(
  "/:request_id",
  protect,
  authorizeRoles("Donor", "NGO"),
  deletePickupRequest,
);

module.exports = router;
