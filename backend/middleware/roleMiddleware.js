const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        // Authentication middleware should run first
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        // Check user's role
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied. You do not have permission to perform this action."
            });
        }

        next();
    };
};

module.exports = {
    authorizeRoles
};
