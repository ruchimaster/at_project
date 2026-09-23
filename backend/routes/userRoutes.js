const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPendingNGOs,
  approveNGO,
  rejectNGO
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

const { validate } = require("../middleware/validationMiddleware");

const {
  validateRegisterUser,
  validateLoginUser,
} = require("../validators/userValidator");

// ==========================================
// AUTH
// ==========================================

router.post("/register", validate(validateRegisterUser), registerUser);

router.post("/login", validate(validateLoginUser), loginUser);
// ==========================================
// ADMIN
// ==========================================
router.get("/", protect, authorizeRoles("Admin"), getAllUsers);

// Get pending NGOs
router.get(
  "/admin/pending-ngos",
  protect,
  authorizeRoles("Admin"),
  getPendingNGOs
);

// Approve NGO
router.put(
  "/admin/ngos/:user_id/approve",
  protect,
  authorizeRoles("Admin"),
  approveNGO
);

// Reject NGO
router.put(
  "/admin/ngos/:user_id/reject",
  protect,
  authorizeRoles("Admin"),
  rejectNGO
);

// ==========================================
// USER
// ==========================================

router.get("/:user_id", protect, getUserById);

router.put("/:user_id", protect, updateUser);

router.delete("/:user_id", protect, authorizeRoles("Admin"), deleteUser);

module.exports = router;
