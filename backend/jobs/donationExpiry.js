const Donation = require("../models/donations");
const Notification = require("../models/notifications");

// ==========================================
// CHECK AND EXPIRE DONATIONS
// ==========================================
const expireDonations = async () => {
    try {
        const currentTime = new Date();

        // Find donations whose availability time has passed
        const expiredDonations = await Donation.find({
            available_until: { $lte: currentTime },
            status: {
                $in: ["Available", "Requested"]
            }
        });

        for (const donation of expiredDonations) {

            // Change donation status
            donation.status = "Expired";

            await donation.save();

            // Create notification for donor
            const lastNotification = await Notification.findOne().sort({
                notification_id: -1
            });

            let notification_id = "NOT001";

            if (
                lastNotification &&
                lastNotification.notification_id
            ) {
                const lastNumber = parseInt(
                    lastNotification.notification_id.replace("NOT", "")
                );

                notification_id = `NOT${String(lastNumber + 1).padStart(3, "0")}`;
            }

            await Notification.create({
                notification_id,
                user_id: donation.donor_id,
                message: `Your donation ${donation.donation_id} has expired because its availability time has passed.`,
                type: "Donation Expired",
                is_read: false
            });

            console.log(
                `Donation ${donation.donation_id} expired.`
            );
        }

    } catch (error) {
        console.error(
            "Donation expiry job error:",
            error.message
        );
    }
};


// ==========================================
// START DONATION EXPIRY JOB
// ==========================================
const startDonationExpiryJob = () => {

    // Check immediately when server starts
    expireDonations();

    // Check every 1 minute
    setInterval(() => {
        expireDonations();
    }, 60 * 1000);

    console.log("Donation expiry job started.");
};


module.exports = {
    startDonationExpiryJob
};