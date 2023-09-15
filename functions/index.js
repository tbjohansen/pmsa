// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
// const {logger} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/v2/https");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
// const {getFirestore} = require("firebase-admin/firestore");
// const {getAuth} = require("firebase-admin/auth");

const {setGlobalOptions} = require("firebase-functions/v2");
setGlobalOptions({maxInstances: 10});

const admin = require("firebase-admin");

const serviceAccount = require("./env/hrmsmsa-196c7-a96bad1f2b96.json");

initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hrmsmsa-196c7-default-rtdb.firebaseio.com",
});

// const db = getFirestore();
// const auth = getAuth();

const createUser = require("./createUser");
const createNewUser = require("./createNewUser");

exports.createUser = createUser.createUser;
exports.createNewUser = createNewUser.createNewUser;
