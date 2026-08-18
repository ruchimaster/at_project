const express = require("express");

const {
    createPickupRequest,
    getAllPickupRequests,
    getPickupRequestById,
    updatePickupRequest,
    deletePickupRequest
} = require("../controllers/pickupRequestController");

const router = express.Router();

// Create pickup request
router.post("/", createPickupRequest);

// Get all pickup requests
router.get("/", getAllPickupRequests);

// Get pickup request by ID
router.get("/:request_id", getPickupRequestById);

// Update pickup request
router.put("/:request_id", updatePickupRequest);

// Delete pickup request
router.delete("/:request_id", deletePickupRequest);

module.exports = router;
