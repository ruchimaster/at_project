const mongoose = require("mongoose");

const warningSchema = new mongoose.Schema({
  warning_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  user_id: {
    type: String,
    required: true,
    trim: true,
  },

  complaint_id: {
    type: String,
    required: true,
    trim: true,
  },

  action_taken: {
    type: String,
    required: true,
    trim: true,
  },

  warning_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Warning", warningSchema);
