const validateComplaint = (req) => {
  const errors = [];

  const { complaint_type, description } = req.body;

  if (!complaint_type?.trim()) {
    errors.push("Complaint type is required");
  }

  if (!description?.trim()) {
    errors.push("Complaint description is required");
  }

  return errors;
};

module.exports = {
  validateComplaint,
};