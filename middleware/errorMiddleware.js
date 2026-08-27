const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid input data",
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }

  // Duplicate MongoDB value
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
  }

  // Unknown server error
  res.status(500).json({
    success: false,
    message: "An internal server error occurred",
  });
};

module.exports = errorHandler;