// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object

firebase.initializeApp({
  apiKey: "AIzaSyCRMJz1ld9AExywcQfVI4lYSlQrGKMi29o",
  authDomain: "lustrous-maxim-419405.firebaseapp.com",
  projectId: "lustrous-maxim-419405",
  storageBucket: "lustrous-maxim-419405.firebasestorage.app",
  messagingSenderId: "264013304597",
  appId: "1:264013304597:web:0f93f7dde107ed4eb3cf1c",
  measurementId: "G-5RH3KNE3SY",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("service worker", payload);

  const notificationTitle = payload.notification.title;

  const notificationsOptions = {
    body: payload.notification.body,
    icons: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationsOptions);
});
