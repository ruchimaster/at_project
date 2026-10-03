const Donation = require("../models/donations");
const PickupRequest = require("../models/pickupRequests");
const User = require("../models/users");

// ============================================================
// GET ANALYTICS
// ============================================================

const getAnalytics = async (req, res, next) => {
  try {
    const { user_id, role } = req.user;

    // ========================================================
    // ADMIN ANALYTICS
    // ========================================================

    if (role === "Admin") {
      const [
        totalUsers,
        totalDonors,
        totalNGOs,
        pendingNGOs,
        totalDonations,
        totalPickupRequests,
        totalDonatedQuantity,
        totalRescuedQuantity,
        donationStatusCounts,
        pickupStatusCounts,
        monthlyDonations,
        monthlyCompletedPickups,
      ] = await Promise.all([
        User.countDocuments(),

        User.countDocuments({
          role: "Donor",
        }),

        User.countDocuments({
          role: "NGO",
        }),

        User.countDocuments({
          role: "NGO",
          account_status: "Pending",
        }),

        Donation.countDocuments(),

        PickupRequest.countDocuments(),

        Donation.aggregate([
          {
            $group: {
              _id: null,
              total: {
                $sum: "$quantity",
              },
            },
          },
        ]),

        Donation.aggregate([
          {
            $match: {
              status: "Completed",
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$quantity",
              },
            },
          },
        ]),

        Donation.aggregate([
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]),

        PickupRequest.aggregate([
          {
            $group: {
              _id: "$request_status",
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]),

        Donation.aggregate([
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$created_at",
                },
              },
              count: {
                $sum: 1,
              },
              quantity: {
                $sum: "$quantity",
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]),

        PickupRequest.aggregate([
          {
            $match: {
              request_status: "Completed",
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$request_date",
                },
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]),
      ]);

      return res.status(200).json({
        role,

        summary: {
          totalUsers,
          totalDonors,
          totalNGOs,
          pendingNGOs,
          totalDonations,
          totalPickupRequests,

          totalDonatedQuantity: totalDonatedQuantity[0]?.total || 0,

          totalRescuedQuantity: totalRescuedQuantity[0]?.total || 0,
        },

        donationStatusCounts,

        pickupStatusCounts,

        monthlyDonations,

        monthlyCompletedPickups,
      });
    }

    // ========================================================
    // NGO ANALYTICS
    // ========================================================

    if (role === "NGO") {
      const [
        totalRequests,
        pendingRequests,
        acceptedRequests,
        completedRequests,
        cancelledRequests,
        rejectedRequests,
        completedDonationIds,
      ] = await Promise.all([
        PickupRequest.countDocuments({
          ngo_id: user_id,
        }),

        PickupRequest.countDocuments({
          ngo_id: user_id,
          request_status: "Pending",
        }),

        PickupRequest.countDocuments({
          ngo_id: user_id,
          request_status: "Accepted",
        }),

        PickupRequest.countDocuments({
          ngo_id: user_id,
          request_status: "Completed",
        }),

        PickupRequest.countDocuments({
          ngo_id: user_id,
          request_status: "Cancelled",
        }),

        PickupRequest.countDocuments({
          ngo_id: user_id,
          request_status: "Rejected",
        }),

        PickupRequest.find({
          ngo_id: user_id,
          request_status: "Completed",
        })
          .select("donation_id")
          .lean(),
      ]);

      const donationIds = completedDonationIds.map(
        (request) => request.donation_id,
      );

      let rescuedQuantity = 0;

      if (donationIds.length > 0) {
        const result = await Donation.aggregate([
          {
            $match: {
              donation_id: {
                $in: donationIds,
              },
              status: "Completed",
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$quantity",
              },
            },
          },
        ]);

        rescuedQuantity = result[0]?.total || 0;
      }

      const monthlyCompletedPickups = await PickupRequest.aggregate([
        {
          $match: {
            ngo_id: user_id,
            request_status: "Completed",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$request_date",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      return res.status(200).json({
        role,

        summary: {
          totalRequests,
          pendingRequests,
          acceptedRequests,
          completedRequests,
          cancelledRequests,
          rejectedRequests,
          rescuedQuantity,
        },

        monthlyCompletedPickups,
      });
    }

    // ========================================================
    // DONOR ANALYTICS
    // ========================================================

    if (role === "Donor") {
      const [
        totalDonations,
        availableDonations,
        requestedDonations,
        acceptedDonations,
        pickedUpDonations,
        completedDonations,
        expiredDonations,
        cancelledDonations,
        totalQuantity,
        completedQuantity,
        monthlyDonations,
      ] = await Promise.all([
        Donation.countDocuments({
          donor_id: user_id,
        }),

        Donation.countDocuments({
          donor_id: user_id,
          status: "Available",
        }),

        Donation.countDocuments({
          donor_id: user_id,
          status: "Requested",
        }),

        Donation.countDocuments({
          donor_id: user_id,
          status: "Accepted",
        }),

        Donation.countDocuments({
          donor_id: user_id,
          status: "PickedUp",
        }),

        Donation.countDocuments({
          donor_id: user_id,
          status: "Completed",
        }),

        Donation.countDocuments({
          donor_id: user_id,
          status: "Expired",
        }),

        Donation.countDocuments({
          donor_id: user_id,
          status: "Cancelled",
        }),

        Donation.aggregate([
          {
            $match: {
              donor_id: user_id,
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$quantity",
              },
            },
          },
        ]),

        Donation.aggregate([
          {
            $match: {
              donor_id: user_id,
              status: "Completed",
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$quantity",
              },
            },
          },
        ]),

        Donation.aggregate([
          {
            $match: {
              donor_id: user_id,
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$created_at",
                },
              },
              count: {
                $sum: 1,
              },
              quantity: {
                $sum: "$quantity",
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]),
      ]);

      return res.status(200).json({
        role,

        summary: {
          totalDonations,
          availableDonations,
          requestedDonations,
          acceptedDonations,
          pickedUpDonations,
          completedDonations,
          expiredDonations,
          cancelledDonations,

          totalQuantity: totalQuantity[0]?.total || 0,

          completedQuantity: completedQuantity[0]?.total || 0,
        },

        monthlyDonations,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
};
