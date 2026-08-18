const express = require("express");

const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/", getAllUsers);
router.get("/:user_id", getUserById);

router.put("/:user_id", updateUser);
router.delete("/:user_id", deleteUser);

module.exports = router;

