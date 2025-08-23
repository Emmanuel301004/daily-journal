// src/MainPage.js - Fixed Version
import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  where,
  serverTimestamp,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import "./MainPage.css";

function MainPage({ user, handleLogout }) {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isWriting, setIsWriting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileImageError, setProfileImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Default avatar
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f5f5f5' stroke='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='12' fill='%23666'/%3E%3Cellipse cx='50' cy='70' rx='20' ry='12' fill='%23666'/%3E%3C/svg%3E";

  // Load entries on component mount
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    loadEntries();
  }, [user?.uid]);

  const loadEntries = async () => {
    if (!user?.uid) return;
    
    try {
      // console.log("Loading entries for user:", user.uid);
      
      const entriesRef = collection(db, 'entries');
      
      // Simple query without orderBy to avoid index requirements
      const q = query(
        entriesRef, 
        where('userId', '==', user.uid)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          // console.log("Entries found:", querySnapshot.size);
          const entriesData = [];
          
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            // console.log("Entry data:", docSnapshot.id, data);
            
            // Convert Firestore Timestamp to Date if needed
            let createdAtDate = data.createdAt;
            if (data.timestamp && data.timestamp.toDate) {
              createdAtDate = data.timestamp.toDate().toISOString();
            } else if (data.timestamp && typeof data.timestamp === 'object' && data.timestamp.seconds) {
              createdAtDate = new Date(data.timestamp.seconds * 1000).toISOString();
            }
            
            entriesData.push({
              id: docSnapshot.id,
              ...data,
              createdAt: createdAtDate || data.createdAt || new Date().toISOString()
            });
          });
          
          // Sort entries by date (newest first) in JavaScript
          entriesData.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date);
            const dateB = new Date(b.createdAt || b.date);
            return dateB - dateA;
          });
          
          setEntries(entriesData);
          setLoading(false);
          setError(null);
          
          // console.log("Total entries loaded:", entriesData.length);
        },
        (error) => {
          // console.error("Firestore error:", error);
          setError("Failed to load entries. Please refresh the page.");
          setLoading(false);
        }
      );

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (error) {
      // console.error("Load entries error:", error);
      setError("Database connection failed.");
      setLoading(false);
    }
  };

  // Photo URL handler
  const getPhotoURL = () => {
    if (profileImageError) return defaultAvatar;
    if (user?.photoURL) {
      let photoURL = user.photoURL.replace(/^http:/, 'https:');
      if (photoURL.includes('googleusercontent.com') && !photoURL.includes('=s')) {
        photoURL = `${photoURL}=s200-c`;
      }
      return photoURL;
    }
    return defaultAvatar;
  };

  const handleImageError = (e) => {
    setProfileImageError(true);
    e.target.src = defaultAvatar;
  };

  const handleImageLoad = () => {
    setProfileImageError(false);
  };

  // Save entry
  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) {
      alert("Please write something before saving!");
      return;
    }

    if (!user?.uid) {
      alert("Please sign in to save entries.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const now = new Date();
      const entryData = {
        userId: user.uid,
        userEmail: user.email || 'unknown@example.com',
        title: currentTitle.trim() || `Entry - ${formatDate(selectedDate)}`,
        date: selectedDate,
        content: currentEntry.trim(),
        timestamp: serverTimestamp(),
        wordCount: currentEntry.trim().split(/\s+/).length,
        createdAt: now.toISOString() // Add ISO string for consistent sorting
      };
      
      const docRef = await addDoc(collection(db, 'entries'), entryData);
      // console.log("Entry saved with ID:", docRef.id);
      
      // Reset form
      setCurrentEntry("");
      setCurrentTitle("");
      setIsWriting(false);
      
      // alert("Entry saved successfully! 📝");
      
    } catch (error) {
      // console.error("Save error:", error);
      // alert("Failed to save entry. Please try again.");
      setError("Save failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'entries', id));
      // console.log("Entry deleted:", id);
    } catch (error) {
      // console.error("Delete error:", error);
      alert("Failed to delete entry. Please try again.");
    }
  };

  // Helper functions
  const filteredEntries = entries.filter(entry => 
    entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.date?.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.displayName?.split(' ')[0] || 'Friend';
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="main-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading your diary...</h2>
          <p>Please wait while we fetch your entries</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page">
      <header className="header">
        <div className="header-left">
          <div className="diary-icon">📖</div>
          <div className="user-info">
            <h1>Your Personal Diary</h1>
            <p className="greeting">{getGreeting()}</p>
          </div>
        </div>
        <div className="header-right">
          <img
            src={getPhotoURL()}
            alt="Profile"
            className="profile-pic"
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          <div className="header-stats">
            <span className="entries-count">{entries.length} entries</span>
            <button className="logout-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Error Display */}
        {error && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #f44336',
            color: '#c62828',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{margin: 0}}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '10px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        )}

        <aside className="sidebar">
          {entries.length > 0 && (
            <div className="search-container">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search your memories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>
          )}

          <div className="new-entry-section">
            <button 
              className={`new-entry-btn ${isWriting ? 'active' : ''}`}
              onClick={() => setIsWriting(!isWriting)}
              disabled={saving}
            >
              {isWriting ? '✖ Cancel' : '✏️ Write New Entry'}
            </button>
          </div>

          {isWriting && (
            <div className="entry-form">
              <div className="form-header">
                <h3>📝 New Diary Entry</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="date-input"
                />
              </div>
              
              <input
                type="text"
                placeholder="Entry title (optional)"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                className="title-input"
                disabled={saving}
              />
              
              <textarea
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                placeholder="Dear diary, today was..."
                className="entry-textarea"
                autoFocus
                disabled={saving}
              />
              
              <div className="form-footer">
                <span className="word-count">
                  {currentEntry.trim() ? currentEntry.trim().split(/\s+/).length : 0} words
                </span>
                <button 
                  onClick={handleSaveEntry}
                  className="save-btn"
                  disabled={!currentEntry.trim() || saving}
                >
                  {saving ? '💾 Saving...' : '💾 Save Entry'}
                </button>
              </div>
            </div>
          )}

          {entries.length > 0 && (
            <div className="stats-container">
              <h3>📊 Your Journey</h3>
              <div className="stat-item">
                <span className="stat-number">{entries.length}</span>
                <span className="stat-label">Total Entries</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0).toLocaleString()}
                </span>
                <span className="stat-label">Words Written</span>
              </div>
            </div>
          )}
        </aside>

        <div className="content-area">
          <div className="entries-container">
            {filteredEntries.length === 0 ? (
              <div className="empty-state">
                {entries.length === 0 ? (
                  <>
                    <div className="empty-diary-icon">📖</div>
                    <h2>Welcome to Your Personal Diary</h2>
                    <p>This is your private space to capture thoughts, memories, and experiences.</p>
                    <p>Start writing your first entry to begin your journey!</p>
                  </>
                ) : (
                  <>
                    <div className="empty-search-icon">🔍</div>
                    <h3>No entries found</h3>
                    <p>Try adjusting your search terms.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="entries-list">
                {filteredEntries.map(entry => (
                  <article key={entry.id} className="entry diary-page">
                    <div className="diary-page-header">
                      <div className="diary-date">
                        <span className="day">{new Date(entry.date || entry.createdAt).getDate()}</span>
                        <span className="month">
                          {new Date(entry.date || entry.createdAt).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="diary-title">
                        <h3>{entry.title || 'Untitled Entry'}</h3>
                        <time className="entry-date">
                          {formatDate(entry.date || entry.createdAt)}
                        </time>
                      </div>
                      <button 
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="delete-btn"
                        aria-label="Delete entry"
                        title="Delete this entry"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="diary-content">
                      <p className="diary-greeting">Dear Diary,</p>
                      <div className="entry-text">
                        {entry.content}
                      </div>
                    </div>
                    
                    <footer className="diary-footer">
                      <div className="entry-meta">
                        <span className="word-count">📝 {entry.wordCount || 0} words</span>
                        <span className="entry-time">
                          ⏰ {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          }) : 'Unknown time'}
                        </span>
                      </div>
                      <div className="diary-signature">
                        💕 {user?.displayName?.split(' ')[0] || 'Me'}
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;