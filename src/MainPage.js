// src/MainPage.js - Fixed Profile Picture Loading
import React, { useState, useEffect } from "react";
import "./MainPage.css";

function MainPage({ user, handleLogout }) {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isWriting, setIsWriting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileImageError, setProfileImageError] = useState(false);

  // Create a default avatar as a data URL
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f5f5f5' stroke='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='12' fill='%23666'/%3E%3Cellipse cx='50' cy='70' rx='20' ry='12' fill='%23666'/%3E%3C/svg%3E";

  // Load entries from sessionStorage on component mount
  useEffect(() => {
    const savedEntries = JSON.parse(sessionStorage.getItem('diaryEntries') || '[]');
    setEntries(savedEntries);
  }, []);

  // Save entries to sessionStorage whenever entries change
  useEffect(() => {
    sessionStorage.setItem('diaryEntries', JSON.stringify(entries));
  }, [entries]);

  // Function to get the best available photo URL with better error handling
  const getPhotoURL = () => {
    // If we've already had an error loading the user's photo, use default
    if (profileImageError) {
      return defaultAvatar;
    }

    if (user?.photoURL) {
      let photoURL = user.photoURL;
      
      // For Google photos, ensure proper size parameter and use https
      if (photoURL.includes('googleusercontent.com')) {
        // Ensure https protocol
        photoURL = photoURL.replace(/^http:/, 'https:');
        
        // Add size parameter if not present
        if (!photoURL.includes('=s')) {
          photoURL = `${photoURL}=s200-c`;
        }
        
        console.log("Using Google photo URL:", photoURL);
        return photoURL;
      }
      
      // For other providers, ensure https
      photoURL = photoURL.replace(/^http:/, 'https:');
      console.log("Using photo URL:", photoURL);
      return photoURL;
    }
    
    console.log("No photoURL available, using default avatar");
    return defaultAvatar;
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    console.error("Profile image failed to load:", e.target.src);
    setProfileImageError(true);
    e.target.src = defaultAvatar;
  };

  // Handle successful image loading
  const handleImageLoad = () => {
    console.log("Profile image loaded successfully");
    setProfileImageError(false);
  };

  const handleSaveEntry = () => {
    if (currentEntry.trim()) {
      const newEntry = {
        id: Date.now(),
        date: selectedDate,
        content: currentEntry,
        timestamp: new Date().toISOString(),
        wordCount: currentEntry.trim().split(/\s+/).length
      };
      
      setEntries(prev => [newEntry, ...prev]);
      setCurrentEntry("");
      setIsWriting(false);
    }
  };

  const handleDeleteEntry = (id) => {
    if (window.confirm("Delete this entry?")) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.date.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="main-page">
      <header className="header">
        <div className="header-left">
          <img
            src={getPhotoURL()}
            alt="Profile"
            className="profile-pic"
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          <div className="user-info">
            <h1>Journal</h1>
            <p>{user?.displayName || user?.email || 'User'}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="entries-count">{entries.length} entries</span>
          <button className="logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Search */}
        {entries.length > 0 && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}

        {/* New Entry Button */}
        <div className="new-entry-section">
          <button 
            className={`new-entry-btn ${isWriting ? 'active' : ''}`}
            onClick={() => setIsWriting(!isWriting)}
          >
            {isWriting ? 'Cancel' : 'New Entry'}
          </button>
        </div>

        {/* Writing Form */}
        {isWriting && (
          <div className="entry-form">
            <div className="form-header">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="Write your thoughts..."
              className="entry-textarea"
              autoFocus
            />
            
            <div className="form-footer">
              <span className="word-count">
                {currentEntry.trim() ? currentEntry.trim().split(/\s+/).length : 0} words
              </span>
              <button 
                onClick={handleSaveEntry}
                className="save-btn"
                disabled={!currentEntry.trim()}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="entries-container">
          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              {entries.length === 0 ? (
                <>
                  <h2>Welcome to your journal</h2>
                  <p>Start writing to capture your thoughts and experiences.</p>
                </>
              ) : (
                <p>No entries match your search.</p>
              )}
            </div>
          ) : (
            <div className="entries-list">
              {filteredEntries.map(entry => (
                <article key={entry.id} className="entry">
                  <header className="entry-header">
                    <time className="entry-date">{formatDate(entry.date)}</time>
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="delete-btn"
                      aria-label="Delete entry"
                    >
                      ×
                    </button>
                  </header>
                  <div className="entry-content">
                    {entry.content}
                  </div>
                  <footer className="entry-footer">
                    <span>{entry.wordCount} words</span>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MainPage;