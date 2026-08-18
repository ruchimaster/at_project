const Donation = require("../models/donations");

// ==========================================
// CREATE DONATION
// ==========================================
const createDonation = async (req, res) => {
    try {
        const {
            donor_id,
            food_name,
            description,
            quantity,
            pickup_address,
            contact_number,
            available_until
        } = req.body;

        // Check required fields
        if (
            !donor_id ||
            !food_name ||
            !quantity ||
            !pickup_address ||
            !contact_number ||
            !available_until
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        // Check whether available_until is a valid date
        const expiryDate = new Date(available_until);

        if (isNaN(expiryDate.getTime())) {
            return res.status(400).json({
                message: "Invalid available_until date"
            });
        }

        // available_until must be in the future
        if (expiryDate <= new Date()) {
            return res.status(400).json({
                message: "available_until must be a future date and time"
            });
        }

        // Generate readable Donation ID
        const lastDonation = await Donation.findOne().sort({
            donation_id: -1
        });

        let donation_id = "DON001";

        if (lastDonation && lastDonation.donation_id) {
            const lastNumber = parseInt(
                lastDonation.donation_id.replace("DON", "")
            );

            donation_id = `DON${String(lastNumber + 1).padStart(3, "0")}`;
        }

        // Create donation
        const donation = await Donation.create({
            donation_id,
            donor_id,
            food_name,
            description,
            quantity,
            pickup_address,
            contact_number,
            available_until: expiryDate
        });

        res.status(201).json({
            message: "Donation created successfully",
            donation
        });

    } catch (error) {
        console.error("Create donation error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET ALL DONATIONS
// ==========================================
const getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.find();

        res.status(200).json(donations);

    } catch (error) {
        console.error("Get donations error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET DONATION BY ID
// ==========================================
const getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findOne({
            donation_id: req.params.donation_id
        });

        if (!donation) {
            return res.status(404).json({
                message: "Donation not found"
            });
        }

        res.status(200).json(donation);

    } catch (error) {
        console.error("Get donation error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE DONATION
// ==========================================
const updateDonation = async (req, res) => {
    try {
        const donation = await Donation.findOne({
            donation_id: req.params.donation_id
        });

        if (!donation) {
            return res.status(404).json({
                message: "Donation not found"
            });
        }

        const {
            food_name,
            description,
            quantity,
            pickup_address,
            contact_number,
            available_until,
            status
        } = req.body;

        if (food_name !== undefined) {
            donation.food_name = food_name;
        }

        if (description !== undefined) {
            donation.description = description;
        }

        if (quantity !== undefined) {
            donation.quantity = quantity;
        }

        if (pickup_address !== undefined) {
            donation.pickup_address = pickup_address;
        }

        if (contact_number !== undefined) {
            donation.contact_number = contact_number;
        }

        // Validate new available_until
        if (available_until !== undefined) {
            const expiryDate = new Date(available_until);

            if (isNaN(expiryDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid available_until date"
                });
            }

            if (expiryDate <= new Date()) {
                return res.status(400).json({
                    message: "available_until must be a future date and time"
                });
            }

            donation.available_until = expiryDate;
        }

        if (status !== undefined) {
            donation.status = status;
        }

        // Set completed_at when donation becomes Completed
        if (status === "Completed" && !donation.completed_at) {
            donation.completed_at = new Date();
        }

        // Clear completed_at if status is changed away from Completed
        if (status !== "Completed" && status !== undefined) {
            donation.completed_at = null;
        }

        await donation.save();

        res.status(200).json({
            message: "Donation updated successfully",
            donation
        });

    } catch (error) {
        console.error("Update donation error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// DELETE DONATION
// ==========================================
const deleteDonation = async (req, res) => {
    try {
        const donation = await Donation.findOneAndDelete({
            donation_id: req.params.donation_id
        });

        if (!donation) {
            return res.status(404).json({
                message: "Donation not found"
            });
        }

        res.status(200).json({
            message: "Donation deleted successfully"
        });

    } catch (error) {
        console.error("Delete donation error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
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
    deleteDonation
};