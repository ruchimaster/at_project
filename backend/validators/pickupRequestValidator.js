const validatePickupRequest = (req) => {
  const errors = [];

  const { donation_id } = req.body;

  if (!donation_id?.trim()) {
    errors.push("Donation ID is required");
  }

  return errors;
};

module.exports = {
  validatePickupRequest,
};
