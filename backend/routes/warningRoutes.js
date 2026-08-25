const express = require("express");

const router = express.Router();

const {
  createWarning,
  getAllWarnings,
  getWarningById,
  updateWarning,
  deleteWarning,
} = require("../controllers/warningController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("Admin"), createWarning);

router.get("/", protect, authorizeRoles("Admin"), getAllWarnings);

router.get("/:warning_id", protect, getWarningById);

router.put("/:warning_id", protect, authorizeRoles("Admin"), updateWarning);

router.delete("/:warning_id", protect, authorizeRoles("Admin"), deleteWarning);

module.exports = router;
