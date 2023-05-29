const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPushNotification = functions.https.onCall(async (data, context) => {
    console.log(data.source,data.destination);
  const message = {
    notification: {
      title: 'New Transport',
      body: `Source: ${data.source} Destination: ${data.destination}`
    },
    tokens: [] // to be filled from Firestore
  };

  // Fetch FCM tokens from Firestore and collect the corresponding user emails
  const volunteers = await admin.firestore().collection('Volunteers').get();
  const emails = [];
  volunteers.forEach(volunteer => {
    const fcmToken = volunteer.data().fcmToken;
    if (fcmToken) {
        console.log(fcmToken);
      message.tokens.push(fcmToken);
      emails.push(volunteer.id);
    }
  });

  console.log('Users to receive notification:', emails);

  // Send a message to devices subscribed to the provided topic.
  return admin.messaging().sendMulticast(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
      // Wrap the response in a 'data' field
      return { data: { success: true }};
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      // Wrap the error message in a 'data' field
      return { data: { success: false }};
    });
});



const cors = require('cors')({ origin: true });

