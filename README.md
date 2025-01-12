# GST Invoicing System

## Overview

This system is designed to handle GST (Goods and Services Tax) calculations and filings for bookings. It listens for changes in the booking status and processes the GST accordingly when a booking is marked as "finished".

## System Design

### Firebase Functions

The system uses Firebase Cloud Functions to handle events triggered by changes in Firestore. Specifically, it listens for updates to documents in the `bookings` collection.

### Firestore Structure

- **Collection:** `bookings`
  - **Document:** `{bookingId}`
    - **Fields:**
      - `name`: The name of the person who made the booking.
      - `totalBookingAmount`: The total amount for the booking.
      - `status`: The current status of the booking (e.g., pending, finished).
      - `gstDetails`: Details of the GST calculation and filing.

### GST Calculations

The GST rate is set at 18% (`GST_RATE = 0.18`). When a booking is marked as "finished", the system calculates the GST as follows:

- **GST Amount:** `totalBookingAmount * GST_RATE`
- **CGST (Central GST):** `GST Amount / 2`
- **SGST (State GST):** `GST Amount / 2`
- **IGST (Integrated GST):** `GST Amount`

### Handling Booking Status Change

The function `handleBookingStatusChange` is triggered when a document in the `bookings` collection is updated. It performs the following steps:

1. **Check Status Change:** If the status has not changed or is not "finished", the function exits.
2. **Calculate GST:** Compute the GST amount, CGST, SGST, and IGST based on the total booking amount.
3. **Prepare Payload:** Create a payload with the GST details.
4. **File GST:** If testing mode is enabled (`IS_TESTING = true`), simulate the GST API response. Otherwise, call the `fileGst` function to file the GST using an external API.
5. **Update Firestore:** Update the booking document with the GST details and the filing timestamp.

### GST Filing

The `fileGst` function sends a POST request to an external GST API to file the GST. It includes the GST details in the request payload and handles any errors that may occur during the API call.

## Configuration

- **GST Rate:** The GST rate is set to 18%. This can be adjusted by changing the `GST_RATE` constant.
- **Testing Mode:** The system can operate in testing mode by setting `IS_TESTING` to `true`. In testing mode, the GST API call is simulated.

## Error Handling

The system includes error handling to log any issues that occur during the GST processing and filing steps. Errors are logged to the console for debugging purposes.

## Conclusion

This GST Invoicing System automates the process of calculating and filing GST for bookings. It ensures accurate GST calculations and provides a seamless integration with an external GST filing API.
