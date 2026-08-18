const Warning = require("../models/warnings");

// ==========================================
// CREATE WARNING
// ==========================================
const createWarning = async (req, res) => {
  try {
    const { user_id, complaint_id, warning_count, action_taken } = req.body;

    // Check required fields
    if (!user_id || !complaint_id) {
      return res.status(400).json({
        message: "User ID and Complaint ID are required",
      });
    }

    // Generate readable Warning ID
    const lastWarning = await Warning.findOne().sort({
      warning_id: -1,
    });

    let warning_id = "WAR001";

    if (lastWarning && lastWarning.warning_id) {
      const lastNumber = parseInt(lastWarning.warning_id.replace("WAR", ""));

      warning_id = `WAR${String(lastNumber + 1).padStart(3, "0")}`;
    }

    const warning = await Warning.create({
      warning_id,
      user_id,
      complaint_id,
      warning_count: warning_count || 1,
      action_taken: action_taken || "Warning Issued",
    });

    res.status(201).json({
      message: "Warning created successfully",
      warning,
    });
  } catch (error) {
    console.error("Create warning error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL WARNINGS
// ==========================================
const getAllWarnings = async (req, res) => {
  try {
    const warnings = await Warning.find();

    res.status(200).json(warnings);
  } catch (error) {
    console.error("Get warnings error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET WARNING BY ID
// ==========================================
const getWarningById = async (req, res) => {
  try {
    const warning = await Warning.findOne({
      warning_id: req.params.warning_id,
    });

    if (!warning) {
      return res.status(404).json({
        message: "Warning not found",
      });
    }

    res.status(200).json(warning);
  } catch (error) {
    console.error("Get warning error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE WARNING
// ==========================================
const updateWarning = async (req, res) => {
  try {
    const warning = await Warning.findOne({
      warning_id: req.params.warning_id,
    });

    if (!warning) {
      return res.status(404).json({
        message: "Warning not found",
      });
    }

    const { warning_count, action_taken } = req.body;

    if (warning_count !== undefined) {
      warning.warning_count = warning_count;
    }

    if (action_taken !== undefined) {
      warning.action_taken = action_taken;
    }

    await warning.save();

    res.status(200).json({
      message: "Warning updated successfully",
      warning,
    });
  } catch (error) {
    console.error("Update warning error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE WARNING
// ==========================================
const deleteWarning = async (req, res) => {
  try {
    const warning = await Warning.findOneAndDelete({
      warning_id: req.params.warning_id,
    });

    if (!warning) {
      return res.status(404).json({
        message: "Warning not found",
      });
    }

    res.status(200).json({
      message: "Warning deleted successfully",
    });
  } catch (error) {
    console.error("Delete warning error:", error);

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
  createWarning,
  getAllWarnings,
  getWarningById,
  updateWarning,
  deleteWarning,
};
