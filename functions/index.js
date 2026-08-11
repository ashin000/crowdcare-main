const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");

admin.initializeApp();

// Initialize API keys from Firebase functions secrets / environment config
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "stub-sendgrid-key";
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "stub-twilio-sid";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "stub-twilio-token";
const TWILIO_NUMBER = process.env.TWILIO_NUMBER || "+15005550006";

sgMail.setApiKey(SENDGRID_API_KEY);
const smsClient = TWILIO_SID !== "stub-twilio-sid" ? twilio(TWILIO_SID, TWILIO_AUTH_TOKEN) : null;

/**
 * 1. Triggered when a status change history log is added to an issue.
 * Sends an email/SMS alert to the citizen who filed the report.
 */
exports.onIssueStatusChange = onDocumentCreated("issues/{issueId}/statusHistory/{historyId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  
  const historyData = snapshot.data();
  const issueId = event.params.issueId;

  try {
    // Fetch the main issue to retrieve the reporter's details
    const db = admin.firestore();
    const issueDoc = await db.collection("issues").doc(issueId).get();
    if (!issueDoc.exists) return;
    
    const issueData = issueDoc.data();
    const reporterId = issueData.reportedBy;

    // Fetch the reporter's email and phone number
    const userDoc = await db.collection("users").doc(reporterId).get();
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const email = userData.email;
    const phone = userData.phone;

    const messageText = `CrowdCare Update: The status of your civic ticket (${issueData.issueId}) "${issueData.title}" has been updated to "${historyData.status.toUpperCase()}". Remarks: ${historyData.comment}`;

    // Send email alert (SendGrid)
    if (email && SENDGRID_API_KEY !== "stub-sendgrid-key") {
      const msg = {
        to: email,
        from: "alerts@crowdcare.gov.in",
        subject: `[CrowdCare] Ticket ${issueData.issueId} Status Update`,
        text: messageText,
        html: `<p><strong>Dear Citizen,</strong></p><p>Your reported issue status has been updated.</p><p><strong>Ticket ID:</strong> ${issueData.issueId}<br><strong>Title:</strong> ${issueData.title}<br><strong>New Status:</strong> ${historyData.status.toUpperCase()}<br><strong>Officer Remarks:</strong> ${historyData.comment}</p><p>Thank you for collaborating with municipal authorities.</p>`
      };
      await sgMail.send(msg);
      console.log(`Email update sent to ${email}`);
    }

    // Send SMS alert (Twilio)
    if (phone && smsClient) {
      await smsClient.messages.create({
        body: messageText,
        from: TWILIO_NUMBER,
        to: phone
      });
      console.log(`SMS update sent to ${phone}`);
    }

  } catch (err) {
    console.error("Cloud functions status trigger notification failure:", err);
  }
});

/**
 * 2. Broadcasts announcement notifications to all system devices.
 */
exports.onAnnouncementBroadcast = onDocumentCreated("announcements/{announcementId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  const annData = snapshot.data();

  try {
    const payload = {
      notification: {
        title: `Official Announcement: ${annData.title}`,
        body: annData.content
      },
      topic: "announcements"
    };

    // Broadcast message via Firebase Cloud Messaging (FCM)
    await admin.messaging().send(payload);
    console.log(`FCM broadcast published: ${annData.title}`);
  } catch (err) {
    console.error("Cloud functions FCM announcement broadcast failure:", err);
  }
});
