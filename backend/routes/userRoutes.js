const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

const { validate } = require("../middleware/validationMiddleware");

const {
  validateRegisterUser,
  validateLoginUser,
} = require("../validators/userValidator");

router.post("/register", validate(validateRegisterUser), registerUser);

router.post("/login", validate(validateLoginUser), loginUser);

router.get("/", protect, authorizeRoles("Admin"), getAllUsers);

router.get("/:user_id", protect, getUserById);

router.put("/:user_id", protect, updateUser);

router.delete("/:user_id", protect, authorizeRoles("Admin"), deleteUser);

module.exports = router;
