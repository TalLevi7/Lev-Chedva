importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTeU4pAho_VCMSzMLbLx1hYxOX0OXz6Dw",
  authDomain: "lev-chedva.firebaseapp.com",
  projectId: "lev-chedva",
  storageBucket: "lev-chedva.appspot.com",
  messagingSenderId: "26782490776",
  appId: "1:26782490776:web:f01fa5e0e173598004b0ed",
  measurementId: "G-21J5YB0GCW"
};

// Initialize Firebase in the Service Worker
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Customize the notification behavior for background messages
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body });
});