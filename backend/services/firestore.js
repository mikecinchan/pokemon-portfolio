const axios = require('axios');
require('dotenv').config();

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY = process.env.FIREBASE_API_KEY;

/**
 * Firestore REST API wrapper
 * Using REST API instead of Admin SDK to avoid service account requirements
 */

// Helper to convert Firestore document format
const parseFirestoreDocument = (doc) => {
  if (!doc.fields) return {};

  const data = {};
  for (const [key, value] of Object.entries(doc.fields)) {
    if (value.stringValue !== undefined) data[key] = value.stringValue;
    else if (value.integerValue !== undefined) data[key] = parseInt(value.integerValue);
    else if (value.doubleValue !== undefined) data[key] = parseFloat(value.doubleValue);
    else if (value.booleanValue !== undefined) data[key] = value.booleanValue;
    else if (value.timestampValue !== undefined) data[key] = value.timestampValue;
  }
  return data;
};

// Helper to convert JS object to Firestore format
const toFirestoreDocument = (data) => {
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') fields[key] = { stringValue: value };
    else if (typeof value === 'number') {
      if (Number.isInteger(value)) fields[key] = { integerValue: value };
      else fields[key] = { doubleValue: value };
    }
    else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
  }
  return { fields };
};

const firestoreDB = {
  // Query collection with filters
  async query(collection, userId, orderByField = 'createdAt', direction = 'DESCENDING') {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;

      const query = {
        structuredQuery: {
          from: [{ collectionId: collection }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'userId' },
              op: 'EQUAL',
              value: { stringValue: userId }
            }
          },
          orderBy: [{
            field: { fieldPath: orderByField },
            direction: direction
          }]
        }
      };

      const response = await axios.post(url, query, {
        params: { key: API_KEY }
      });

      const results = [];
      if (response.data) {
        for (const item of response.data) {
          if (item.document) {
            const id = item.document.name.split('/').pop();
            const data = parseFirestoreDocument(item.document);
            results.push({ id, ...data });
          }
        }
      }
      return results;
    } catch (error) {
      console.error('Firestore query error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a single document
  async getDoc(collection, docId) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
      const response = await axios.get(url, {
        params: { key: API_KEY }
      });

      if (response.data) {
        return {
          exists: true,
          id: docId,
          data: () => parseFirestoreDocument(response.data)
        };
      }
      return { exists: false };
    } catch (error) {
      if (error.response?.status === 404) {
        return { exists: false };
      }
      console.error('Firestore getDoc error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create a document
  async addDoc(collection, data) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}`;
      const response = await axios.post(url, toFirestoreDocument(data), {
        params: { key: API_KEY }
      });

      const docId = response.data.name.split('/').pop();
      return { id: docId };
    } catch (error) {
      console.error('Firestore addDoc error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update a document
  async updateDoc(collection, docId, data) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;

      const updateMask = Object.keys(data).join(',');

      await axios.patch(url, toFirestoreDocument(data), {
        params: {
          key: API_KEY,
          updateMask: updateMask
        }
      });

      return true;
    } catch (error) {
      console.error('Firestore updateDoc error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a document
  async deleteDoc(collection, docId) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
      await axios.delete(url, {
        params: { key: API_KEY }
      });
      return true;
    } catch (error) {
      console.error('Firestore deleteDoc error:', error.response?.data || error.message);
      throw error;
    }
  }
};

console.log('Firestore REST API initialized successfully');

module.exports = { db: firestoreDB };
