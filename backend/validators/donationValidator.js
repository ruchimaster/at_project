const validateDonation = (req) => {
  const errors = [];

  const {
    food_name,
    description,
    quantity,
    pickup_address,
    contact_number,
    available_until,
  } = req.body;

  if (!food_name?.trim()) {
    errors.push("Food name is required");
  }

  if (description !== undefined && typeof description !== "string") {
    errors.push("Description must be text");
  }

  if (quantity === undefined || quantity === null || quantity === "") {
    errors.push("Quantity is required");
  } else if (isNaN(quantity) || Number(quantity) <= 0) {
    errors.push("Quantity must be greater than 0");
  }

  if (!pickup_address?.trim()) {
    errors.push("Pickup address is required");
  }

  if (!contact_number?.trim()) {
    errors.push("Contact number is required");
  } else if (!/^[0-9]{10}$/.test(contact_number)) {
    errors.push("Contact number must contain exactly 10 digits");
  }

  if (!available_until) {
    errors.push("Available until date and time is required");
  } else {
    const expiryDate = new Date(available_until);

    if (isNaN(expiryDate.getTime())) {
      errors.push("Invalid available_until date");
    } else if (expiryDate <= new Date()) {
      errors.push("Available until must be a future date and time");
    }
  }

  return errors;
};

module.exports = {
  validateDonation,
};
