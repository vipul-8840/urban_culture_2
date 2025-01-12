

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
admin.initializeApp();
const db = admin.firestore();

const GST_RATE = 0.18;
const IS_TESTING = true; // Set this to `false` to disable testing mode

exports.handleBookingStatusChange = functions.firestore
  .document("bookings/{bookingId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (beforeData.status === afterData.status || afterData.status !== "finished") {
      return null;
    }

    const { name, totalBookingAmount } = afterData;

    try {
      const gstAmount = totalBookingAmount * GST_RATE;
      const cgstSgst = gstAmount / 2;
      const igst = gstAmount;

      const gstPayload = {
        name,
        totalBookingAmount,
        gstAmount,
        cgst: cgstSgst,
        sgst: cgstSgst,
        igst,
      };

      let gstApiResponse;

      if (IS_TESTING) {
        gstApiResponse = { success: true, message: "Test GST API call successful." };
        console.log("Testing Mode Active: Simulated GST API Response", gstApiResponse);
      } else {
        gstApiResponse = await fileGst(gstPayload);
      }

      await db.collection("bookings").doc(context.params.bookingId).update({
        gstDetails: {
          cgst: cgstSgst,
          sgst: cgstSgst,
          igst,
          gstAmount,
          filedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });

      console.log("GST processing complete:", gstApiResponse);
    } catch (error) {
      console.error("Error processing GST:", error);
    }
  });

  async function fileGst(payload) {
    try {
      const apiUrl = "https://example-gst-api.com/file";
      const apiKey = "your-gst-api-key";
  
      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
  
      return response.data;
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      throw new Error("GST API call failed");
    }
  }
