const validateComplaint = (req) => {
  const errors = [];

  const { title, description, category } = req.body;

  if (!title?.trim()) {
    errors.push("Complaint title is required");
  }

  if (!description?.trim()) {
    errors.push("Complaint description is required");
  }

  if (!category?.trim()) {
    errors.push("Complaint category is required");
  }

  return errors;
};

module.exports = {
  validateComplaint,
};
