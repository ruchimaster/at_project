const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// REGISTER USER
// ==========================================
const registerUser = async (req, res) => {
    try {
        const {
            organization_name,
            organization_type,
            contact_person,
            email,
            phone,
            address,
            password,
            role
        } = req.body;

        // Check required fields
        if (
            !organization_name ||
            !organization_type ||
            !contact_person ||
            !email ||
            !phone ||
            !address ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        // Only Donor and NGO can register
        if (!["Donor", "NGO"].includes(role)) {
            return res.status(400).json({
                message: "Only Donor or NGO registration is allowed"
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Generate readable User ID
        const lastUser = await User.findOne().sort({ user_id: -1 });

        let user_id = "USR001";

        if (lastUser && lastUser.user_id) {
            const lastNumber = parseInt(
                lastUser.user_id.replace("USR", "")
            );

            user_id = `USR${String(lastNumber + 1).padStart(3, "0")}`;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Account status
        // Donor → Active
        // NGO → Pending
        const account_status =
            role === "Donor" ? "Active" : "Pending";

        // Create user
        const user = await User.create({
            user_id,
            organization_name,
            organization_type,
            contact_person,
            email,
            phone,
            address,
            password: hashedPassword,
            role,
            account_status
        });

        // Don't send password in response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                user_id: user.user_id,
                organization_name: user.organization_name,
                organization_type: user.organization_type,
                contact_person: user.contact_person,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                account_status: user.account_status
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// LOGIN USER
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check account status
        if (user.account_status === "Pending") {
            return res.status(403).json({
                message: "Your account is pending admin approval"
            });
        }

        if (
            user.account_status === "Rejected" ||
            user.account_status === "Suspended" ||
            user.account_status === "Blocked"
        ) {
            return res.status(403).json({
                message: `Your account is ${user.account_status.toLowerCase()}`
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                organization_name: user.organization_name,
                organization_type: user.organization_type,
                contact_person: user.contact_person,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                account_status: user.account_status,
                warning_count: user.warning_count
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET ALL USERS
// ==========================================
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json(users);

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET USER BY ID
// ==========================================
const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({
            user_id: req.params.user_id
        }).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE USER
// ==========================================
const updateUser = async (req, res) => {
    try {
        const user = await User.findOne({
            user_id: req.params.user_id
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const {
            organization_name,
            organization_type,
            contact_person,
            email,
            phone,
            address,
            password
        } = req.body;

        if (organization_name !== undefined) {
            user.organization_name = organization_name;
        }

        if (organization_type !== undefined) {
            user.organization_type = organization_type;
        }

        if (contact_person !== undefined) {
            user.contact_person = contact_person;
        }

        if (email !== undefined) {
            user.email = email;
        }

        if (phone !== undefined) {
            user.phone = phone;
        }

        if (address !== undefined) {
            user.address = address;
        }

        // Hash new password
        if (password !== undefined) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({
            message: "User updated successfully",
            user: {
                user_id: user.user_id,
                organization_name: user.organization_name,
                organization_type: user.organization_type,
                contact_person: user.contact_person,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                account_status: user.account_status,
                warning_count: user.warning_count
            }
        });

    } catch (error) {
        console.error("Update user error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// DELETE USER
// ==========================================
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({
            user_id: req.params.user_id
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};