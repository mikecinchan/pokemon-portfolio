const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.firestore();
    }

    // Initialize with service account credentials
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });

    console.log('Firebase Admin initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

const db = initializeFirebase();

module.exports = { admin, db };
