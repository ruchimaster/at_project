const Warning = require("../models/warnings");
const User = require("../models/users");
const Complaint = require("../models/complaints");


// ==========================================
// CREATE WARNING
// ==========================================
const createWarning = async (req, res) => {
 try {
   const { user_id, complaint_id, action_taken } = req.body;


   // Check required fields
   if (!user_id || !complaint_id) {
     return res.status(400).json({
       message: "User ID and Complaint ID are required",
     });
   }


   // Check if user exists
   const user = await User.findOne({ user_id });


   if (!user) {
     return res.status(404).json({
       message: "User not found",
     });
   }


   // Check if complaint exists
   const complaint = await Complaint.findOne({ complaint_id });


   if (!complaint) {
     return res.status(404).json({
       message: "Complaint not found",
     });
   }


   // Check if complaint belongs to the user
   if (complaint.user_id !== user_id) {
     return res.status(400).json({
       message: "Complaint does not belong to this user",
     });
   }


   // Generate readable Warning ID
   const lastWarning = await Warning.findOne().sort({
     warning_id: -1,
   });


   let warning_id = "WAR001";


   if (lastWarning && lastWarning.warning_id) {
     const lastNumber = parseInt(
       lastWarning.warning_id.replace("WAR", "")
     );


     warning_id = `WAR${String(lastNumber + 1).padStart(3, "0")}`;
   }


   // Increment warning count on User
   user.warning_count += 1;


   await user.save();


   // Create warning
   const warning = await Warning.create({
     warning_id,
     user_id,
     complaint_id,
     action_taken: action_taken || "Warning Issued",
   });


   res.status(201).json({
     message: "Warning created successfully",
     warning,
     warning_count: user.warning_count,
   });
 } catch (error) {
   console.error("Create warning error:", error);


   res.status(500).json({
     message: "Server error",
     error: error.message,
   });
 }
};


// ==========================================
// GET ALL WARNINGS
// ==========================================
const getAllWarnings = async (req, res) => {
 try {
   const warnings = await Warning.find();


   res.status(200).json(warnings);
 } catch (error) {
   console.error("Get warnings error:", error);


   res.status(500).json({
     message: "Server error",
     error: error.message,
   });
 }
};


// ==========================================
// GET WARNING BY ID
// ==========================================
const getWarningById = async (req, res) => {
 try {
   const warning = await Warning.findOne({
     warning_id: req.params.warning_id,
   });


   if (!warning) {
     return res.status(404).json({
       message: "Warning not found",
     });
   }


   res.status(200).json(warning);
 } catch (error) {
   console.error("Get warning error:", error);


   res.status(500).json({
     message: "Server error",
     error: error.message,
   });
 }
};


// ==========================================
// UPDATE WARNING
// ==========================================
const updateWarning = async (req, res) => {
 try {
   const warning = await Warning.findOne({
     warning_id: req.params.warning_id,
   });


   if (!warning) {
     return res.status(404).json({
       message: "Warning not found",
     });
   }


   // warning_count is NOT stored in Warning.
   // Only action_taken can be updated.
   const { action_taken } = req.body;


   if (action_taken !== undefined) {
     if (!action_taken.trim()) {
       return res.status(400).json({
         message: "Action taken cannot be empty",
       });
     }


     warning.action_taken = action_taken;
   }


   await warning.save();


   res.status(200).json({
     message: "Warning updated successfully",
     warning,
   });
 } catch (error) {
   console.error("Update warning error:", error);


   res.status(500).json({
     message: "Server error",
     error: error.message,
   });
 }
};


// ==========================================
// DELETE WARNING
// ==========================================
const deleteWarning = async (req, res) => {
 try {
   const warning = await Warning.findOne({
     warning_id: req.params.warning_id,
   });


   if (!warning) {
     return res.status(404).json({
       message: "Warning not found",
     });
   }


   await Warning.deleteOne({
     warning_id: req.params.warning_id,
   });


   res.status(200).json({
     message: "Warning deleted successfully", }); } catch (error) { console.error("Delete warning error:", error); res.status(500).json({ message: "Server error", error: error.message, }); } };
     // ==========================================
     // // EXPORT CONTROLLERS //
     //  ==========================================
     //
     module.exports =
     { createWarning,
       getAllWarnings,
       getWarningById,
       updateWarning,
       deleteWarning, };
