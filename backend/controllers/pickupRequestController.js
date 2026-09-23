const PickupRequest = require("../models/pickupRequests");
const Donation = require("../models/donations");

// ==========================================
// CREATE PICKUP REQUEST
// NGO creates a request for an Available donation
// ==========================================
const createPickupRequest = async (req, res) => {
  try {
    const { donation_id } = req.body;

    // donation_id is required
    if (!donation_id) {
      return res.status(400).json({
        message: "Donation ID is required",
      });
    }

    // Find donation
    const donation = await Donation.findOne({
      donation_id,
    });

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    // Only Available donations can be requested
    if (donation.status !== "Available") {
      return res.status(400).json({
        message: `Donation cannot be requested because its status is ${donation.status}`,
      });
    }

    // Check whether this NGO already has a request for this donation
    const existingRequest = await PickupRequest.findOne({
      donation_id,
      ngo_id: req.user.user_id,
      request_status: {
        $in: ["Pending", "Accepted"],
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have an active request for this donation",
      });
    }

    // Generate Request ID
    const lastRequest = await PickupRequest.findOne().sort({
      request_id: -1,
    });

    let request_id = "REQ001";

    if (lastRequest && lastRequest.request_id) {
      const lastNumber = parseInt(
        lastRequest.request_id.replace("REQ", "")
      );

      request_id = `REQ${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // Create pickup request
    const pickupRequest = await PickupRequest.create({
      request_id,
      donation_id,
      ngo_id: req.user.user_id,
      request_status: "Pending",
    });

    // Change donation status
    donation.status = "Requested";

    await donation.save();

    res.status(201).json({
      message: "Pickup request created successfully",
      pickupRequest,
      donation,
    });
  } catch (error) {
    console.error("Create pickup request error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL PICKUP REQUESTS
// Admin can view all pickup requests
// ==========================================
const getAllPickupRequests = async (req, res) => {
  try {
    const pickupRequests = await PickupRequest.find();

    res.status(200).json(pickupRequests);
  } catch (error) {
    console.error("Get pickup requests error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET PICKUP REQUEST BY ID
// Donor can see requests for their donations
// NGO can see their own requests
// Admin can see any request
// ==========================================
const getPickupRequestById = async (req, res) => {
  try {
    const pickupRequest = await PickupRequest.findOne({
      request_id: req.params.request_id,
    });

    if (!pickupRequest) {
      return res.status(404).json({
        message: "Pickup request not found",
      });
    }

    // Admin can view any request
    if (req.user.role === "Admin") {
      return res.status(200).json(pickupRequest);
    }

    // NGO can view only their own request
    if (req.user.role === "NGO") {
      if (pickupRequest.ngo_id !== req.user.user_id) {
        return res.status(403).json({
          message: "You are not authorized to view this pickup request",
        });
      }

      return res.status(200).json(pickupRequest);
    }

    // Donor can view requests belonging to their donation
    if (req.user.role === "Donor") {
      const donation = await Donation.findOne({
        donation_id: pickupRequest.donation_id,
      });

      if (!donation) {
        return res.status(404).json({
          message: "Related donation not found",
        });
      }

      if (donation.donor_id !== req.user.user_id) {
        return res.status(403).json({
          message: "You are not authorized to view this pickup request",
        });
      }

      return res.status(200).json(pickupRequest);
    }

    return res.status(403).json({
      message: "Access denied",
    });
  } catch (error) {
    console.error("Get pickup request error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PICKUP REQUEST
// Donor: Accept / Reject
// NGO: Cancel / Complete
// ==========================================
const updatePickupRequest = async (req, res) => {
  try {
    const pickupRequest = await PickupRequest.findOne({
      request_id: req.params.request_id,
    });

    if (!pickupRequest) {
      return res.status(404).json({
        message: "Pickup request not found",
      });
    }

    const { request_status } = req.body;

    if (!request_status) {
      return res.status(400).json({
        message: "Request status is required",
      });
    }

    // Find related donation
    const donation = await Donation.findOne({
      donation_id: pickupRequest.donation_id,
    });

    if (!donation) {
      return res.status(404).json({
        message: "Related donation not found",
      });
    }

    // ==========================================
    // DONOR ACTIONS
    // ==========================================
    if (req.user.role === "Donor") {
      // Check ownership
      if (donation.donor_id !== req.user.user_id) {
        return res.status(403).json({
          message: "You are not authorized to modify this pickup request",
        });
      }

      // Donor can accept
      if (request_status === "Accepted") {
        if (pickupRequest.request_status !== "Pending") {
          return res.status(400).json({
            message: "Only pending requests can be accepted",
          });
        }

        pickupRequest.request_status = "Accepted";
        donation.status = "Accepted";
      }

      // Donor can reject
      else if (request_status === "Rejected") {
        if (pickupRequest.request_status !== "Pending") {
          return res.status(400).json({
            message: "Only pending requests can be rejected",
          });
        }

        pickupRequest.request_status = "Rejected";

        // Make donation available again
        donation.status = "Available";
      }

      else {
        return res.status(403).json({
          message: "Donor can only accept or reject a pending request",
        });
      }
    }

    // ==========================================
    // NGO ACTIONS
    // ==========================================
    else if (req.user.role === "NGO") {
      // NGO can modify only its own request
      if (pickupRequest.ngo_id !== req.user.user_id) {
        return res.status(403).json({
          message: "You are not authorized to modify this pickup request",
        });
      }

      // NGO can cancel pending/accepted request
      if (request_status === "Cancelled") {
        if (
          pickupRequest.request_status !== "Pending" &&
          pickupRequest.request_status !== "Accepted"
        ) {
          return res.status(400).json({
            message: "This request cannot be cancelled",
          });
        }

        pickupRequest.request_status = "Cancelled";

        // Make donation available again
        donation.status = "Available";
      }

      // NGO marks pickup as completed
      else if (request_status === "Completed") {
        if (pickupRequest.request_status !== "Accepted") {
          return res.status(400).json({
            message: "Only accepted requests can be completed",
          });
        }

        pickupRequest.request_status = "Completed";

        donation.status = "Completed";
        donation.completed_at = new Date();
      }

      else {
        return res.status(403).json({
          message: "NGO can only cancel or complete its request",
        });
      }
    }

    else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await pickupRequest.save();
    await donation.save();

    res.status(200).json({
      message: "Pickup request updated successfully",
      pickupRequest,
      donation,
    });
  } catch (error) {
    console.error("Update pickup request error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE PICKUP REQUEST
// NGO can delete/cancel its own pending request
// ==========================================
const deletePickupRequest = async (req, res) => {
  try {
    const pickupRequest = await PickupRequest.findOne({
      request_id: req.params.request_id,
    });

    if (!pickupRequest) {
      return res.status(404).json({
        message: "Pickup request not found",
      });
    }

    // Find donation
    const donation = await Donation.findOne({
      donation_id: pickupRequest.donation_id,
    });

    if (!donation) {
      return res.status(404).json({
        message: "Related donation not found",
      });
    }

    // NGO can delete only its own request
    if (req.user.role === "NGO") {
      if (pickupRequest.ngo_id !== req.user.user_id) {
        return res.status(403).json({
          message: "You are not authorized to delete this pickup request",
        });
      }
    }

    // Donor can delete only request belonging to their donation
    else if (req.user.role === "Donor") {
      if (donation.donor_id !== req.user.user_id) {
        return res.status(403).json({
          message: "You are not authorized to delete this pickup request",
        });
      }
    }

    else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Do not delete accepted/completed requests
    if (
      pickupRequest.request_status === "Accepted" ||
      pickupRequest.request_status === "Completed"
    ) {
      return res.status(400).json({
        message: `Request cannot be deleted because its status is ${pickupRequest.request_status}`,
      });
    }

    await PickupRequest.deleteOne({
      request_id: req.params.request_id,
    });

    // If request was pending, make donation available again
    if (pickupRequest.request_status === "Pending") {
      donation.status = "Available";
      await donation.save();
    }

    res.status(200).json({
      message: "Pickup request deleted successfully",
    });
  } catch (error) {
    console.error("Delete pickup request error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createPickupRequest,
  getAllPickupRequests,
  getPickupRequestById,
  updatePickupRequest,
  deletePickupRequest,
};