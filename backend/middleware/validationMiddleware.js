const validate = (validationFunction) => {
  return (req, res, next) => {
    try {
      const errors = validationFunction(req);

      if (errors.length > 0) {
        return res.status(400).json({
          message: "Validation failed",
          errors,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validate,
};
