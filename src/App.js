import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./.env/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Login from "./pages/auth/Login";
import AppRoutes from "./routes/App.routes";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { primaryTheme } from "./assets/utils/themes";
import { Toaster } from "react-hot-toast";

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

  // console.log(user);

  return (
    <div>
      <><Toaster/></>
      {renderComponent()}
    </div>
  );
};

export default App;
