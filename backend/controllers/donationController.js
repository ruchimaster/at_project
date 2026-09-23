const Donation = require("../models/donations");

// ==========================================
// CREATE DONATION
// ==========================================
const createDonation = async (req, res) => {
  try {
    const {
      food_name,
      description,
      quantity,
      pickup_address,
      contact_number,
      available_until,
    } = req.body;

    // Basic validation is already handled by validateDonation middleware.
    // Get donor_id from the logged-in user's JWT, NOT from req.body.

    // Generate readable Donation ID
    const lastDonation = await Donation.findOne().sort({
      donation_id: -1,
    });

    let donation_id = "DON001";

    if (lastDonation && lastDonation.donation_id) {
      const lastNumber = parseInt(
        lastDonation.donation_id.replace("DON", ""),
        10
      );

      if (Number.isNaN(lastNumber)) {
        return res.status(500).json({
          message: "Unable to generate donation ID",
        });
      }

      donation_id = `DON${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // Create donation
    const donation = await Donation.create({
      donation_id,
      donor_id: req.user.user_id,
      food_name,
      description,
      quantity: Number(quantity),
      pickup_address,
      contact_number,
      available_until: new Date(available_until),
    });

    res.status(201).json({
      message: "Donation created successfully",
      donation,
    });
  } catch (error) {
    console.error("Create donation error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL DONATIONS
// ==========================================
const getAllDonations = async (req, res) => {
  try {
    let donations;

    // Donor → see only their own donations
    if (req.user.role === "Donor") {
      donations = await Donation.find({
        donor_id: req.user.user_id,
      });
    }

    // NGO → see only available donations
    else if (req.user.role === "NGO") {
      donations = await Donation.find({
        status: "Available",
      });
    }

    // Admin → see all donations
    else if (req.user.role === "Admin") {
      donations = await Donation.find();
    }

    // Any other role
    else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json(donations);
  } catch (error) {
    console.error("Get donations error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// GET DONATION BY ID
// ==========================================
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      donation_id: req.params.donation_id,
    });

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    // Donor → can view only their own donation
    if (req.user.role === "Donor") {
      if (donation.donor_id !== req.user.user_id) {
        return res.status(403).json({
          message: "You are not authorized to view this donation",
        });
      }
    }

    // NGO → can view only available donations
    else if (req.user.role === "NGO") {
      if (donation.status !== "Available") {
        return res.status(403).json({
          message: "This donation is not available",
        });
      }
    }

    // Admin → can view any donation
    else if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json(donation);
  } catch (error) {
    console.error("Get donation error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE DONATION
// ==========================================
const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      donation_id: req.params.donation_id,
    });

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    // Route already guarantees the user is a Donor.
    // Here we check whether this donation belongs to that Donor.
    if (donation.donor_id !== req.user.user_id) {
      return res.status(403).json({
        message: "You are not authorized to modify this donation",
      });
    }

    // Only Available donations can be edited.
    if (donation.status !== "Available") {
      return res.status(400).json({
        message: `Donation cannot be updated because its status is ${donation.status}`,
      });
    }

    const {
      food_name,
      description,
      quantity,
      pickup_address,
      contact_number,
      available_until,
      status,
    } = req.body;

    // Do not allow status to be changed through this API.
    if (status !== undefined) {
      return res.status(400).json({
        message: "Donation status cannot be changed manually",
      });
    }

    // Update food name
    if (food_name !== undefined) {
      if (typeof food_name !== "string" || !food_name.trim()) {
        return res.status(400).json({
          message: "Food name cannot be empty",
        });
      }

      donation.food_name = food_name.trim();
    }

    // Update description
    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be text",
        });
      }

      donation.description = description;
    }

    // Update quantity
    if (quantity !== undefined) {
      const numericQuantity = Number(quantity);

      if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        return res.status(400).json({
          message: "Quantity must be greater than 0",
        });
      }

      donation.quantity = numericQuantity;
    }

    // Update pickup address
    if (pickup_address !== undefined) {
      if (
        typeof pickup_address !== "string" ||
        !pickup_address.trim()
      ) {
        return res.status(400).json({
          message: "Pickup address cannot be empty",
        });
      }

      donation.pickup_address = pickup_address.trim();
    }

    // Update contact number
    if (contact_number !== undefined) {
      if (!/^[0-9]{10}$/.test(contact_number)) {
        return res.status(400).json({
          message: "Contact number must contain exactly 10 digits",
        });
      }

      donation.contact_number = contact_number;
    }

    // Update available_until
    if (available_until !== undefined) {
      const expiryDate = new Date(available_until);

      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({
          message: "Invalid available_until date",
        });
      }

      if (expiryDate <= new Date()) {
        return res.status(400).json({
          message: "available_until must be a future date and time",
        });
      }

      donation.available_until = expiryDate;
    }

    await donation.save();

    res.status(200).json({
      message: "Donation updated successfully",
      donation,
    });
  } catch (error) {
    console.error("Update donation error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE DONATION
// ==========================================
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      donation_id: req.params.donation_id,
    });

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    // Route already guarantees the user is a Donor.
    // Check whether this donation belongs to that Donor.
    if (donation.donor_id !== req.user.user_id) {
      return res.status(403).json({
        message: "You are not authorized to delete this donation",
      });
    }

    // Only Available donations can be deleted.
    if (donation.status !== "Available") {
      return res.status(400).json({
        message: `Donation cannot be deleted because its status is ${donation.status}`,
      });
    }

    await Donation.deleteOne({
      donation_id: req.params.donation_id,
    });

    res.status(200).json({
      message: "Donation deleted successfully",
    });
  } catch (error) {
    console.error("Delete donation error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
};