const express = require("express");

const router = express.Router();

const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require("../controllers/complaintController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

const { validate } = require("../middleware/validationMiddleware");

const { validateComplaint } = require("../validators/complaintValidator");

router.post("/", protect, validate(validateComplaint), createComplaint);

router.get("/", protect, authorizeRoles("Admin"), getAllComplaints);

router.get("/:complaint_id", protect, getComplaintById);

router.put("/:complaint_id", protect, authorizeRoles("Admin"), updateComplaint);

router.delete(
  "/:complaint_id",
  protect,
  authorizeRoles("Admin"),
  deleteComplaint,
);

module.exports = router;
