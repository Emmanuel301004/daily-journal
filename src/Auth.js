// Auth.js - Updated with Better Error Handling
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "./firebase";
import "./Auth.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in successfully!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("Registered successfully!");
      }
    } catch (error) {
      console.error("Auth error:", error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError("No account found with this email");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password");
          break;
        case 'auth/email-already-in-use':
          setError("An account with this email already exists");
          break;
        case 'auth/weak-password':
          setError("Password should be at least 6 characters");
          break;
        case 'auth/invalid-email':
          setError("Please enter a valid email address");
          break;
        case 'auth/internal-error':
          setError("An internal error occurred. Please try again later.");
          break;
        default:
          setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Configure Google provider with proper settings
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Google login successful:", {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });
      
    } catch (error) {
      console.error("Google login error:", error);
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setError("Login cancelled");
          break;
        case 'auth/popup-blocked':
          setError("Popup was blocked. Please allow popups for this site");
          break;
        case 'auth/internal-error':
          setError("An internal error occurred. Please try again later.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Please check your connection and try again.");
          break;
        default:
          setError("Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="welcome-header">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p className="auth-subtitle">
          {isLogin ? "Sign in to your account" : "Start your journaling journey"}
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          color: '#c66',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
        </button>
      </form>

      <div className="divider">
        <span>or</span>
      </div>

      <button 
        className="google-btn" 
        onClick={handleGoogleLogin}
        disabled={loading}
        type="button"
      >
        <div className="google-icon"></div>
        {loading ? "Loading..." : "Continue with Google"}
      </button>

      <div className="auth-switch">
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            disabled={loading}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;