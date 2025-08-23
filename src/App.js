// src/App.js - Production Version
import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./Auth";
import MainPage from "./MainPage";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Online Diary</h2>
          <p>Loading your personal space...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="welcome-section">
          <h1 className="app-title">Online Diary</h1>
          <p className="app-subtitle">Your private space for thoughts, memories, and experiences</p>
        </div>
        <Auth />
      </div>
    );
  }

  return (
    <div className="app">
      <MainPage user={user} handleLogout={handleLogout} />
    </div>
  );
}

export default App;