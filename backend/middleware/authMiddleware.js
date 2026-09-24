const jwt = require("jsonwebtoken");
const User = require("../models/users");

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check whether Authorization header exists
        if (!authHeader) {
            return res.status(401).json({
                message: "Access denied. Authentication token required."
            });
        }

        // Expected format:
        // Authorization: Bearer <token>
        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid authorization format. Use Bearer token."
            });
        }

        const token = parts[1];

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find current user in database
        const user = await User.findOne({
            user_id: decoded.user_id
        }).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        // Check current account status
        if (user.account_status !== "Active") {
            return res.status(403).json({
                message: `Your account is ${user.account_status.toLowerCase()}`
            });
        }

        // Store current user information
        req.user = {
            user_id: user.user_id,
            role: user.role,
            account_status: user.account_status
        };

        next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token has expired. Please login again."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid token."
            });
        }

        return res.status(500).json({
            message: "Authentication error"
        });
    }
};

module.exports = {
    protect
};