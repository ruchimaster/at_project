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
  rejectNGO,
  suspendUser,
  reactivateUser
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

const { validate } = require("../middleware/validationMiddleware");

const {
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser
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

router.put("/:user_id", protect, validate(validateUpdateUser),updateUser);

router.delete("/:user_id", protect, deleteUser);

router.put(
    "/admin/users/:user_id/suspend",
    protect,
    authorizeRoles("Admin"),
    suspendUser
);

router.put(
    "/admin/users/:user_id/reactivate",
    protect,
    authorizeRoles("Admin"),
    reactivateUser
);


module.exports = router;
