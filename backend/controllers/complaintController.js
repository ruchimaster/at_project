const Complaint = require("../models/complaints");

// ==========================================
// CREATE COMPLAINT
// ==========================================
const createComplaint = async (req, res) => {
  try {
    const { complaint_type, description } = req.body;

      if (!complaint_type || !description) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Generate readable Complaint ID
    const lastComplaint = await Complaint.findOne().sort({
      complaint_id: -1,
    });

    let complaint_id = "CMP001";

    if (lastComplaint && lastComplaint.complaint_id) {
      const lastNumber = parseInt(
        lastComplaint.complaint_id.replace("CMP", ""),
      );

      complaint_id = `CMP${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // Create complaint
    const complaint = await Complaint.create({
      complaint_id,
      user_id: req.user.user_id,
      complaint_type,
      description,
});

    res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL COMPLAINTS
// ==========================================
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Get complaints error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET COMPLAINT BY ID
// ==========================================
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaint_id: req.params.complaint_id,
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    // Admin can view any complaint
    // Normal user can view only their own complaint
    if (
      req.user.role !== "Admin" &&
      complaint.user_id !== req.user.user_id
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this complaint",
      });
    }

    res.status(200).json(complaint);
  } catch (error) {
    console.error("Get complaint error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE COMPLAINT
// ==========================================
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaint_id: req.params.complaint_id,
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    const { complaint_type, description, status } = req.body;

    if (complaint_type !== undefined) {
      complaint.complaint_type = complaint_type;
    }

    if (description !== undefined) {
      complaint.description = description;
    }

    if (status !== undefined) {
      complaint.status = status;
    }

    await complaint.save();

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Update complaint error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE COMPLAINT
// ==========================================
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOneAndDelete({
      complaint_id: req.params.complaint_id,
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Delete complaint error:", error);

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
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
};
