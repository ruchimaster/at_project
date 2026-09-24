const mongoose = require("mongoose");
const PickupRequest = require("../models/pickupRequests");
const Donation = require("../models/donations");

// ==========================================
// CREATE PICKUP REQUEST
// NGO creates a request for an Available donation
// ==========================================
const createPickupRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { donation_id } = req.body;

    if (!donation_id) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Donation ID is required",
      });
    }

    // Find donation only if it is still Available
    // and change it to Requested atomically
    const donation = await Donation.findOneAndUpdate(
      {
        donation_id,
        status: "Available",
      },
      {
        $set: {
          status: "Requested",
        },
      },
      {
        new: true,
        session,
      }
    );

    if (!donation) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Donation is not available for pickup request",
      });
    }

    // Generate request ID
    const lastRequest = await PickupRequest.findOne()
      .sort({
        request_id: -1,
      })
      .session(session);

    let request_id = "REQ001";

    if (lastRequest && lastRequest.request_id) {
      const lastNumber = parseInt(
        lastRequest.request_id.replace("REQ", "")
      );

      request_id = `REQ${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // Create pickup request inside the same transaction
    const pickupRequest = await PickupRequest.create(
      [
        {
          request_id,
          donation_id,
          ngo_id: req.user.user_id,
          request_status: "Pending",
        },
      ],
      {
        session,
      }
    );

    // Both operations succeeded
    await session.commitTransaction();

    res.status(201).json({
      message: "Pickup request created successfully",
      pickupRequest: pickupRequest[0],
      donation,
    });
  } catch (error) {
    // If anything fails, undo the donation status change
    // and any other changes made in this transaction
    await session.abortTransaction();

    console.error("Create pickup request error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// ==========================================
// GET ALL PICKUP REQUESTS
// Admin can view all pickup requests
// ==========================================
const getAllPickupRequests = async (req, res) => {
  try {
    let pickupRequests;

    // Admin can see all pickup requests
    if (req.user.role === "Admin") {
      pickupRequests = await PickupRequest.find();
    }

    // NGO can see only its own requests
    else if (req.user.role === "NGO") {
      pickupRequests = await PickupRequest.find({
        ngo_id: req.user.user_id
      });
    }

    // Donor can see requests for their own donations
    else if (req.user.role === "Donor") {
      const donations = await Donation.find({
        donor_id: req.user.user_id
      }).select("donation_id");

      const donationIds = donations.map(
        donation => donation.donation_id
      );

      pickupRequests = await PickupRequest.find({
        donation_id: { $in: donationIds }
      });
    }

    else {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.status(200).json(pickupRequests);

  } catch (error) {
    console.error("Get pickup requests error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
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