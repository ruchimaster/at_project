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
            user.account_status === "Suspended" 
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

        // Admin can view any user
        // Normal user can view only their own profile
        if (
            req.user.role !== "Admin" &&
            req.user.user_id !== user.user_id
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this user"
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

        // Normal user can update only their own account
        if (
            req.user.role !== "Admin" &&
            req.user.user_id !== req.params.user_id
        ) {
            return res.status(403).json({
                message: "You are not authorized to update this user"
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

        // Validate organization name
        if (organization_name !== undefined) {
            if (
                typeof organization_name !== "string" ||
                !organization_name.trim()
            ) {
                return res.status(400).json({
                    message: "Organization name cannot be empty"
                });
            }

            user.organization_name = organization_name.trim();
        }

        // Validate organization type
        if (organization_type !== undefined) {
            if (
                typeof organization_type !== "string" ||
                !organization_type.trim()
            ) {
                return res.status(400).json({
                    message: "Organization type cannot be empty"
                });
            }

            user.organization_type = organization_type.trim();
        }

        // Validate contact person
        if (contact_person !== undefined) {
            if (
                typeof contact_person !== "string" ||
                !contact_person.trim()
            ) {
                return res.status(400).json({
                    message: "Contact person cannot be empty"
                });
            }

            user.contact_person = contact_person.trim();
        }

        // Validate email
        if (email !== undefined) {
            if (typeof email !== "string") {
                return res.status(400).json({
                    message: "Invalid email"
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email.trim())) {
                return res.status(400).json({
                    message: "Invalid email format"
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            // Check if email belongs to another user
            const existingUser = await User.findOne({
                email: normalizedEmail,
                user_id: { $ne: user.user_id }
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            user.email = normalizedEmail;
        }

        // Validate phone
        if (phone !== undefined) {
            if (
                typeof phone !== "string" ||
                !/^\d{10}$/.test(phone)
            ) {
                return res.status(400).json({
                    message: "Phone must contain exactly 10 digits"
                });
            }

            user.phone = phone;
        }

        // Validate address
        if (address !== undefined) {
            if (
                typeof address !== "string" ||
                !address.trim()
            ) {
                return res.status(400).json({
                    message: "Address cannot be empty"
                });
            }

            user.address = address.trim();
        }

        // Validate and hash password
        if (password !== undefined) {
            if (
                typeof password !== "string" ||
                password.length < 6
            ) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters long"
                });
            }

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
        const user = await User.findOne({
            user_id: req.params.user_id
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Normal user can delete only their own account
        if (
            req.user.role !== "Admin" &&
            req.user.user_id !== user.user_id
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this user"
            });
        }

        await User.deleteOne({
            user_id: req.params.user_id
        });

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
// GET PENDING NGOs
// ==========================================
const getPendingNGOs = async (req, res) => {
    try {
        const ngos = await User.find({
            role: "NGO",
            account_status: "Pending"
        }).select("-password");

        res.status(200).json({
            message: "Pending NGOs fetched successfully",
            ngos
        });

    } catch (error) {
        console.error("Get pending NGOs error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// APPROVE NGO
// ==========================================
const approveNGO = async (req, res) => {
    try {
        const ngo = await User.findOne({
            user_id: req.params.user_id,
            role: "NGO"
        });

        if (!ngo) {
            return res.status(404).json({
                message: "NGO not found"
            });
        }

        if (ngo.account_status === "Active") {
            return res.status(400).json({
                message: "NGO is already approved"
            });
        }

        if (ngo.account_status === "Rejected") {
            return res.status(400).json({
                message: "Rejected NGO cannot be approved"
            });
        }

        ngo.account_status = "Active";

        await ngo.save();

        res.status(200).json({
            message: "NGO approved successfully",
            ngo: {
                user_id: ngo.user_id,
                organization_name: ngo.organization_name,
                organization_type: ngo.organization_type,
                contact_person: ngo.contact_person,
                email: ngo.email,
                phone: ngo.phone,
                address: ngo.address,
                role: ngo.role,
                account_status: ngo.account_status
            }
        });

    } catch (error) {
        console.error("Approve NGO error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// REJECT NGO
// ==========================================
const rejectNGO = async (req, res) => {
    try {
        const ngo = await User.findOne({
            user_id: req.params.user_id,
            role: "NGO"
        });

        if (!ngo) {
            return res.status(404).json({
                message: "NGO not found"
            });
        }

        if (ngo.account_status !== "Pending") {
            return res.status(400).json({
                message: `NGO account is already ${ngo.account_status}`
            });
        }

        ngo.account_status = "Rejected";

        await ngo.save();

        res.status(200).json({
            message: "NGO rejected successfully",
            ngo: {
                user_id: ngo.user_id,
                organization_name: ngo.organization_name,
                email: ngo.email,
                role: ngo.role,
                account_status: ngo.account_status
            }
        });

    } catch (error) {
        console.error("Reject NGO error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// ==========================================
// SUSPEND USER
// ==========================================
const suspendUser = async (req, res) => {
    try {
        const user = await User.findOne({
            user_id: req.params.user_id
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Admin account cannot be suspended
        if (user.role === "Admin") {
            return res.status(403).json({
                message: "Admin account cannot be suspended"
            });
        }

        // Already suspended
        if (user.account_status === "Suspended") {
            return res.status(400).json({
                message: "User is already suspended"
            });
        }

        user.account_status = "Suspended";

        await user.save();

        res.status(200).json({
            message: "User suspended successfully",
            user: {
                user_id: user.user_id,
                organization_name: user.organization_name,
                email: user.email,
                role: user.role,
                account_status: user.account_status
            }
        });

    } catch (error) {
        console.error("Suspend user error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// ==========================================
// REACTIVATE USER
// ==========================================
const reactivateUser = async (req, res) => {
    try {
        const user = await User.findOne({
            user_id: req.params.user_id
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Admin account is already active
        if (user.role === "Admin") {
            return res.status(400).json({
                message: "Admin account is already active"
            });
        }

        // User must currently be suspended
        if (user.account_status !== "Suspended") {
            return res.status(400).json({
                message: `User account is currently ${user.account_status}`
            });
        }

        user.account_status = "Active";

        await user.save();

        res.status(200).json({
            message: "User reactivated successfully",
            user: {
                user_id: user.user_id,
                organization_name: user.organization_name,
                email: user.email,
                role: user.role,
                account_status: user.account_status
            }
        });

    } catch (error) {
        console.error("Reactivate user error:", error);

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
    deleteUser,
    getPendingNGOs,
    approveNGO,
    rejectNGO,
    suspendUser,
    reactivateUser
};