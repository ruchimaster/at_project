const mongoose = require("mongoose");

const PickupRequest = require("../models/pickupRequests");
const Donation = require("../models/donations");
const User = require("../models/users");

const { createNotification } = require("./notificationController");

// ============================================================
// CREATE PICKUP REQUEST
// ============================================================

const createPickupRequest = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { donation_id } = req.body;

    const donation = await Donation.findOne({
      donation_id,
    }).session(session);

    if (!donation) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    if (donation.status !== "Available") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "This donation is no longer available.",
      });
    }

    const existingRequest = await PickupRequest.findOne({
      donation_id,
      ngo_id: req.user.user_id,
      request_status: {
        $in: ["Pending", "Accepted"],
      },
    }).session(session);

    if (existingRequest) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "You already have an active request for this donation.",
      });
    }

    const lastRequest = await PickupRequest.findOne()
      .sort({ created_at: -1 })
      .session(session);

    let nextNumber = 1;

    if (lastRequest?.request_id) {
      const match = lastRequest.request_id.match(/(\d+)$/);

      if (match) {
        nextNumber = Number(match[1]) + 1;
      }
    }

    const request_id = `REQ${String(nextNumber).padStart(3, "0")}`;

    const pickupRequest = await PickupRequest.create(
      [
        {
          request_id,
          donation_id,
          ngo_id: req.user.user_id,
          request_status: "Pending",
          request_date: new Date(),
        },
      ],
      { session },
    );

    donation.status = "Requested";

    await donation.save({ session });

    await session.commitTransaction();

    await createNotification({
      user_id: donation.donor_id,
      title: "New Pickup Request",
      message: `A pickup request has been received for your donation ${donation.donation_id}.`,
      type: "Pickup Request",
      reference_id: request_id,
    });

    return res.status(201).json({
      success: true,
      message: "Pickup request created successfully.",
      data: pickupRequest[0],
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ============================================================
// GET ALL PICKUP REQUESTS
// ============================================================

const getAllPickupRequests = async (req, res, next) => {
  try {
    let query = {};

    // Admin can see all pickup requests
    if (req.user.role === "Admin") {
      query = {};
    }

    // NGO can see only its own pickup requests
    else if (req.user.role === "NGO") {
      query = {
        ngo_id: req.user.user_id,
      };
    }

    // Donor can see pickup requests related to its donations
    else if (req.user.role === "Donor") {
      const donations = await Donation.find({
        donor_id: req.user.user_id,
      })
        .select("donation_id")
        .lean();

      const donationIds = donations.map((donation) => donation.donation_id);

      query = {
        donation_id: {
          $in: donationIds,
        },
      };
    }

    const requests = await PickupRequest.find(query)
      .sort({ created_at: -1 })
      .lean();

    if (requests.length === 0) {
      return res.status(200).json([]);
    }

    // --------------------------------------------------------
    // Collect donation IDs
    // --------------------------------------------------------

    const donationIds = [
      ...new Set(
        requests.map((request) => request.donation_id).filter(Boolean),
      ),
    ];

    // --------------------------------------------------------
    // Collect NGO IDs
    // --------------------------------------------------------

    const ngoIds = [
      ...new Set(requests.map((request) => request.ngo_id).filter(Boolean)),
    ];

    // --------------------------------------------------------
    // Get donation information
    // --------------------------------------------------------

    const donations = await Donation.find({
      donation_id: {
        $in: donationIds,
      },
    })
      .select("donation_id food_name quantity pickup_address donor_id")
      .lean();

    const donationMap = {};

    donations.forEach((donation) => {
      donationMap[donation.donation_id] = donation;
    });

    // --------------------------------------------------------
    // Collect donor IDs
    // --------------------------------------------------------

    const donorIds = [
      ...new Set(
        donations.map((donation) => donation.donor_id).filter(Boolean),
      ),
    ];

    // --------------------------------------------------------
    // Get donor + NGO information
    //
    // IMPORTANT:
    // We now fetch "address" as well because Maps needs:
    //
    // Origin      = donation.pickup_address
    // Destination = NGO user's address
    // --------------------------------------------------------

    const userIds = [...new Set([...ngoIds, ...donorIds])];

    const users = await User.find({
      user_id: {
        $in: userIds,
      },
    })
      .select("user_id organization_name address")
      .lean();

    const userMap = {};

    users.forEach((user) => {
      userMap[user.user_id] = {
        organization_name: user.organization_name,
        address: user.address,
      };
    });

    // --------------------------------------------------------
    // Enrich pickup requests
    // --------------------------------------------------------

    const enrichedRequests = requests.map((request) => {
      const donation = donationMap[request.donation_id];

      const ngo = userMap[request.ngo_id];

      const donor = userMap[donation?.donor_id];

      return {
        ...request,

        ngo: {
          organization_name: ngo?.organization_name || "Unknown Organization",

          address: ngo?.address || "",
        },

        donor: {
          organization_name: donor?.organization_name || "Unknown Organization",

          address: donor?.address || "",
        },

        donation: donation
          ? {
              food_name: donation.food_name,

              quantity: donation.quantity,

              pickup_address: donation.pickup_address,
            }
          : null,
      };
    });

    return res.status(200).json(enrichedRequests);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET PICKUP REQUEST BY ID
// ============================================================

const getPickupRequestById = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    const pickupRequest = await PickupRequest.findOne({
      request_id,
    }).lean();

    if (!pickupRequest) {
      return res.status(404).json({
        success: false,
        message: "Pickup request not found.",
      });
    }

    const donation = await Donation.findOne({
      donation_id: pickupRequest.donation_id,
    }).lean();

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Associated donation not found.",
      });
    }

    // --------------------------------------------------------
    // Authorization
    // --------------------------------------------------------

    const isAdmin = req.user.role === "Admin";

    const isNGO =
      req.user.role === "NGO" && pickupRequest.ngo_id === req.user.user_id;

    const isDonor =
      req.user.role === "Donor" && donation.donor_id === req.user.user_id;

    if (!isAdmin && !isNGO && !isDonor) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this pickup request.",
      });
    }

    // --------------------------------------------------------
    // Fetch donor + NGO
    //
    // Address is included for Maps routing.
    // --------------------------------------------------------

    const users = await User.find({
      user_id: {
        $in: [donation.donor_id, pickupRequest.ngo_id],
      },
    })
      .select("user_id organization_name address")
      .lean();

    const userMap = {};

    users.forEach((user) => {
      userMap[user.user_id] = {
        organization_name: user.organization_name,
        address: user.address,
      };
    });

    return res.status(200).json({
      ...pickupRequest,

      donor: {
        organization_name:
          userMap[donation.donor_id]?.organization_name ||
          "Unknown Organization",

        address: userMap[donation.donor_id]?.address || "",
      },

      ngo: {
        organization_name:
          userMap[pickupRequest.ngo_id]?.organization_name ||
          "Unknown Organization",

        address: userMap[pickupRequest.ngo_id]?.address || "",
      },

      donation: {
        food_name: donation.food_name,

        quantity: donation.quantity,

        pickup_address: donation.pickup_address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE PICKUP REQUEST
// ============================================================

const updatePickupRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    const { request_status } = req.body;

    const pickupRequest = await PickupRequest.findOne({
      request_id,
    });

    if (!pickupRequest) {
      return res.status(404).json({
        success: false,
        message: "Pickup request not found.",
      });
    }

    const donation = await Donation.findOne({
      donation_id: pickupRequest.donation_id,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Associated donation not found.",
      });
    }

    // ========================================================
    // DONOR ACTIONS
    // ========================================================

    if (req.user.role === "Donor") {
      if (donation.donor_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this request.",
        });
      }

      if (!["Accepted", "Rejected"].includes(request_status)) {
        return res.status(400).json({
          success: false,
          message: "Donor can only accept or reject a pickup request.",
        });
      }

      if (pickupRequest.request_status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending pickup requests can be accepted or rejected.",
        });
      }

      pickupRequest.request_status = request_status;

      await pickupRequest.save();

      if (request_status === "Accepted") {
        await Donation.findOneAndUpdate(
          {
            donation_id: pickupRequest.donation_id,
          },
          {
            status: "Requested",
          },
        );

        await createNotification({
          user_id: pickupRequest.ngo_id,
          title: "Pickup Request Accepted",
          message: `Your pickup request ${pickupRequest.request_id} has been accepted by the donor.`,
          type: "Pickup Request",
          reference_id: pickupRequest.request_id,
        });
      }

      if (request_status === "Rejected") {
        await Donation.findOneAndUpdate(
          {
            donation_id: pickupRequest.donation_id,
          },
          {
            status: "Available",
          },
        );

        await createNotification({
          user_id: pickupRequest.ngo_id,
          title: "Pickup Request Rejected",
          message: `Your pickup request ${pickupRequest.request_id} has been rejected by the donor.`,
          type: "Pickup Request",
          reference_id: pickupRequest.request_id,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Pickup request ${request_status.toLowerCase()} successfully.`,
        data: pickupRequest,
      });
    }

    // ========================================================
    // NGO ACTIONS
    // ========================================================

    if (req.user.role === "NGO") {
      if (pickupRequest.ngo_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this request.",
        });
      }

      if (request_status === "Cancelled") {
        if (!["Pending", "Accepted"].includes(pickupRequest.request_status)) {
          return res.status(400).json({
            success: false,
            message: "This pickup request cannot be cancelled.",
          });
        }

        pickupRequest.request_status = "Cancelled";

        await pickupRequest.save();

        if (pickupRequest.request_status !== "Completed") {
          await Donation.findOneAndUpdate(
            {
              donation_id: pickupRequest.donation_id,
            },
            {
              status: "Available",
            },
          );
        }

        await createNotification({
          user_id: donation.donor_id,
          title: "Pickup Request Cancelled",
          message: `Pickup request ${pickupRequest.request_id} has been cancelled by the NGO.`,
          type: "Pickup Request",
          reference_id: pickupRequest.request_id,
        });

        return res.status(200).json({
          success: true,
          message: "Pickup request cancelled successfully.",
          data: pickupRequest,
        });
      }

      if (request_status === "Completed") {
        if (pickupRequest.request_status !== "Accepted") {
          return res.status(400).json({
            success: false,
            message: "Only accepted pickup requests can be completed.",
          });
        }

        pickupRequest.request_status = "Completed";

        await pickupRequest.save();

        donation.status = "Completed";
        donation.completed_at = new Date();

        await donation.save();

        await createNotification({
          user_id: donation.donor_id,
          title: "Pickup Completed",
          message: `Pickup request ${pickupRequest.request_id} has been completed.`,
          type: "Pickup Request",
          reference_id: pickupRequest.request_id,
        });

        return res.status(200).json({
          success: true,
          message: "Pickup completed successfully.",
          data: pickupRequest,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid pickup request status for NGO.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "You are not authorized to update this request.",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE PICKUP REQUEST
// ============================================================

const deletePickupRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    const pickupRequest = await PickupRequest.findOne({
      request_id,
    });

    if (!pickupRequest) {
      return res.status(404).json({
        success: false,
        message: "Pickup request not found.",
      });
    }

    const donation = await Donation.findOne({
      donation_id: pickupRequest.donation_id,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Associated donation not found.",
      });
    }

    // ========================================================
    // AUTHORIZATION
    // ========================================================

    const isDonor =
      req.user.role === "Donor" && donation.donor_id === req.user.user_id;

    const isNGO =
      req.user.role === "NGO" && pickupRequest.ngo_id === req.user.user_id;

    if (!isDonor && !isNGO) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this pickup request.",
      });
    }

    // ========================================================
    // STATUS CHECK
    // ========================================================

    if (["Accepted", "Completed"].includes(pickupRequest.request_status)) {
      return res.status(400).json({
        success: false,
        message: "Accepted or completed pickup requests cannot be deleted.",
      });
    }

    // ========================================================
    // DELETE
    // ========================================================

    await PickupRequest.deleteOne({
      request_id,
    });

    // If the request was pending, make donation available again
    if (pickupRequest.request_status === "Pending") {
      donation.status = "Available";

      await donation.save();
    }

    return res.status(200).json({
      success: true,
      message: "Pickup request deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createPickupRequest,
  getAllPickupRequests,
  getPickupRequestById,
  updatePickupRequest,
  deletePickupRequest,
};
