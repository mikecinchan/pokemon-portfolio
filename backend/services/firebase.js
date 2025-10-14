const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Initialize Firebase Admin SDK with service account credentials
 * This gives the backend admin privileges to bypass Firestore security rules
 */
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin already initialized');
      return admin.firestore();
    }

    // Path to service account key file
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

    // Check if service account file exists
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(
        'Service account key not found!\n' +
        'Please download serviceAccountKey.json from Firebase Console and place it in the backend folder.\n' +
        'Path: ' + serviceAccountPath
      );
    }

    // Load service account credentials
    const serviceAccount = require(serviceAccountPath);

    // Initialize Firebase Admin with service account
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });

    console.log('✅ Firebase Admin initialized with service account credentials');
    console.log(`📁 Project ID: ${serviceAccount.project_id}`);

    return admin.firestore();
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    throw error;
  }
};

const db = initializeFirebase();

module.exports = { admin, db };
