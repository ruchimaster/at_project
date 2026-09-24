const validateRegisterUser = (req) => {
  const errors = [];

  const {
    organization_name,
    organization_type,
    contact_person,
    email,
    phone,
    address,
    password,
    role,
  } = req.body;

  if (!organization_name?.trim()) {
    errors.push("Organization name is required");
  }

  if (!organization_type?.trim()) {
    errors.push("Organization type is required");
  }

  if (!contact_person?.trim()) {
    errors.push("Contact person is required");
  }

  if (!email?.trim()) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }

  if (!phone?.trim()) {
    errors.push("Phone number is required");
  } else if (!/^[0-9]{10}$/.test(phone)) {
    errors.push("Phone number must contain exactly 10 digits");
  }

  if (!address?.trim()) {
    errors.push("Address is required");
  }

  if (!password) {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must contain at least 6 characters");
  }

  if (!role) {
    errors.push("Role is required");
  } else if (!["Donor", "NGO"].includes(role)) {
    errors.push("Role must be either Donor or NGO");
  }

  return errors;
};

const validateLoginUser = (req) => {
  const errors = [];

  const { email, password } = req.body;

  if (!email?.trim()) {
    errors.push("Email is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  return errors;
};

const validateUpdateUser = (req) => {
  const errors = [];

  const {
    organization_name,
    organization_type,
    contact_person,
    email,
    phone,
    address,
    password
  } = req.body;

  if (
    organization_name !== undefined &&
    !organization_name?.trim()
  ) {
    errors.push("Organization name cannot be empty");
  }

  if (
    organization_type !== undefined &&
    !["Restaurant", "Hotel", "Caterer", "NGO", "Other"].includes(
      organization_type
    )
  ) {
    errors.push("Invalid organization type");
  }

  if (
    contact_person !== undefined &&
    !contact_person?.trim()
  ) {
    errors.push("Contact person cannot be empty");
  }

  if (email !== undefined) {
    if (!email.trim()) {
      errors.push("Email cannot be empty");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Invalid email format");
    }
  }

  if (phone !== undefined) {
    if (!/^[0-9]{10}$/.test(phone)) {
      errors.push("Phone number must contain exactly 10 digits");
    }
  }

  if (address !== undefined && !address?.trim()) {
    errors.push("Address cannot be empty");
  }

  if (password !== undefined && password.length < 6) {
    errors.push("Password must contain at least 6 characters");
  }

  return errors;
};

module.exports = {
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
