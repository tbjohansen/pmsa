import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./.env/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Login from "./pages/auth/Login";
import AppRoutes from "./routes/App.routes";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { primaryTheme } from "./assets/utils/themes";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    //check user state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(true);
      } else {
        setUser(false);
      }
    });
  });

  const renderComponent = () => {
    switch (user) {
      case true:
        return (
          <React.Fragment>
            <ThemeProvider theme={primaryTheme}>
              <CssBaseline />
              <AppRoutes />
            </ThemeProvider>
          </React.Fragment>
        );
      case false:
        return <Login />;
      default:
        return <div>{/* //add spiner */}</div>;
    }
  };

  console.log(user);

  return <div>{renderComponent()}</div>;
};

export default App;


// // The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
// // const {logger} = require("firebase-functions");
// // const {onRequest} = require("firebase-functions/v2/https");
// // const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// // The Firebase Admin SDK to access Firestore.
// const {initializeApp} = require("firebase-admin/app");
// // const {getFirestore} = require("firebase-admin/firestore");
// // const {getAuth} = require("firebase-admin/auth");

// initializeApp();

// // const db = getFirestore();
// // const auth = getAuth();

// const createUser = require("./src/auth/createUser");

// exports.createUser = createUser.createUser;


// const {getAuth} = require("firebase-admin/auth");
// const {onRequest} = require("firebase-functions/v2/https");
// exports.createUser = onRequest(async(req, res) => {
//     const writeResult = await getAuth().createUser({
//         email: req.email,
//         emailVerified: true,
//         password: "msa@1234",
//         disabled: false,
//       });

//       res.json({ result: `Message with ID: ${writeResult.id} added.`});
// });
