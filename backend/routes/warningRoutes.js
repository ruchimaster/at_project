const express = require("express");

const {
    createWarning,
    getAllWarnings,
    getWarningById,
    updateWarning,
    deleteWarning
} = require("../controllers/warningController");

const router = express.Router();

// Create warning
router.post("/", createWarning);

// Get all warnings
router.get("/", getAllWarnings);

// Get warning by ID
router.get("/:warning_id", getWarningById);

// Update warning
router.put("/:warning_id", updateWarning);

// Delete warning
router.delete("/:warning_id", deleteWarning);

module.exports = router;
