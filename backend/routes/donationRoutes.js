const express = require("express");

const {
    createDonation,
    getAllDonations,
    getDonationById,
    updateDonation,
    deleteDonation
} = require("../controllers/donationController");

const router = express.Router();

// Create donation
router.post("/", createDonation);
// Get all donations
router.get("/", getAllDonations);

// Get donation by ID
router.get("/:donation_id", getDonationById);

// Update donation
router.put("/:donation_id", updateDonation);

// Delete donation
router.delete("/:donation_id", deleteDonation);

module.exports = router;
