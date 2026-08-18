const express = require("express");

const {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint
} = require("../controllers/complaintController");

const router = express.Router();

// Create complaint
router.post("/", createComplaint);

// Get all complaints
router.get("/", getAllComplaints);

// Get complaint by ID
router.get("/:complaint_id", getComplaintById);

// Update complaint
router.put("/:complaint_id", updateComplaint);

// Delete complaint
router.delete("/:complaint_id", deleteComplaint);

module.exports = router;
