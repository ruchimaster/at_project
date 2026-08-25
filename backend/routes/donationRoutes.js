const express = require("express");

const router = express.Router();

const {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
} = require("../controllers/donationController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

const { validate } = require("../middleware/validationMiddleware");

const { validateDonation } = require("../validators/donationValidator");

router.post(
  "/",
  protect,
  authorizeRoles("Donor"),
  validate(validateDonation),
  createDonation,
);

router.get("/", protect, getAllDonations);

router.get("/:donation_id", protect, getDonationById);

router.put("/:donation_id", protect, authorizeRoles("Donor"), updateDonation);

router.delete(
  "/:donation_id",
  protect,
  authorizeRoles("Donor"),
  deleteDonation,
);

module.exports = router;
