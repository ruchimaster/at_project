const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => error.message);

    return res.status(400).json({
      message: "Validation error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate value already exists",
    });
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid data format",
    });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
};

module.exports = {
  errorHandler,
};
