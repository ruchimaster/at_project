const PickupRequest = require("../models/pickupRequests");

// ==========================================
// CREATE PICKUP REQUEST
// ==========================================
const createPickupRequest = async (req, res) => {
  try {
    const { donation_id, ngo_id } = req.body;

    // Check required fields
    if (!donation_id || !ngo_id) {
      return res.status(400).json({
        message: "Donation ID and NGO ID are required",
      });
    }

    // Generate readable Request ID
    const lastRequest = await PickupRequest.findOne().sort({
      request_id: -1,
    });

    let request_id = "REQ001";

    if (lastRequest && lastRequest.request_id) {
      const lastNumber = parseInt(lastRequest.request_id.replace("REQ", ""));

      request_id = `REQ${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // Create pickup request
    const pickupRequest = await PickupRequest.create({
      request_id,
      donation_id,
      ngo_id,
    });

    res.status(201).json({
      message: "Pickup request created successfully",
      pickupRequest,
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

    res.status(200).json(pickupRequest);
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

    if (request_status !== undefined) {
      pickupRequest.request_status = request_status;
    }

    await pickupRequest.save();

    res.status(200).json({
      message: "Pickup request updated successfully",
      pickupRequest,
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
// ==========================================
const deletePickupRequest = async (req, res) => {
  try {
    const pickupRequest = await PickupRequest.findOneAndDelete({
      request_id: req.params.request_id,
    });

    if (!pickupRequest) {
      return res.status(404).json({
        message: "Pickup request not found",
      });
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

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  createPickupRequest,
  getAllPickupRequests,
  getPickupRequestById,
  updatePickupRequest,
  deletePickupRequest,
};
