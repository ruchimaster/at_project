const jwt = require("jsonwebtoken");

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const protect = (req, res, next) => {
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

        // Store decoded user information
        req.user = decoded;

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
