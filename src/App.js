// src/App.js
import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./Auth";
import MainPage from "./MainPage";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    // console.log("Current user:", currentUser);
    setUser(currentUser);
  });
  return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {!user ? (
        <>
          <h1>Welcome to Online Diary 📖</h1>
          <Auth />
        </>
      ) : (
        <MainPage user={user} handleLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
