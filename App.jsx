/**
 * LastMileConnect - Main Application Shell
 * 
 * Central router/state manager connecting:
 * - Home (Hero & demo dashboard)
 * - RequestForm (Commuter pool request, assigned to Priya)
 * - MatchConfirmation (Live match display & fare savings)
 */

import React, { useState, useEffect } from "react";
import { Home } from "./components/Home/index.js";
import { RequestForm } from "./components/RequestForm/index.js";
import { MatchConfirmation } from "./components/MatchConfirmation/index.js";
import { initDemoStorage } from "./utils/storage.js";
import "./App.css";

export function App() {
  // Screen views: 'home' | 'request' | 'match'
  const [currentScreen, setCurrentScreen] = useState("home");
  const [activeMatchGroup, setActiveMatchGroup] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("Aarav Sharma");

  // Initialize demo data in localStorage on app launch
  useEffect(() => {
    initDemoStorage();
  }, []);

  const handleMatchFound = (matchResult) => {
    if (matchResult && matchResult.matchGroup) {
      setActiveMatchGroup(matchResult.matchGroup);
      setCurrentUserName(matchResult.userRequest?.userName || "Aarav Sharma");
      setCurrentScreen("match");
    } else {
      alert("Request logged! Waiting for another commuter heading to the same zone...");
      setCurrentScreen("home");
    }
  };

  return (
    <div className="lmc-app">
      {/* Top Navbar */}
      <header className="lmc-navbar">
        <div className="lmc-brand" onClick={() => setCurrentScreen("home")}>
          <span className="lmc-brand-logo">🛺</span>
          <span className="lmc-brand-name">
            LastMile<span>Connect</span>
          </span>
        </div>

        <nav className="lmc-nav-links">
          <button
            className={`lmc-nav-btn ${currentScreen === "home" ? "active" : ""}`}
            onClick={() => setCurrentScreen("home")}
          >
            🏠 Home
          </button>
          <button
            className={`lmc-nav-btn ${currentScreen === "request" ? "active" : ""}`}
            onClick={() => setCurrentScreen("request")}
          >
            📝 Request Form
          </button>
          <button
            className={`lmc-nav-btn ${currentScreen === "match" ? "active" : ""}`}
            onClick={() => setCurrentScreen("match")}
          >
            🎯 Match Result
          </button>
        </nav>
      </header>

      {/* Screen Views */}
      <main className="lmc-main-content">
        {currentScreen === "home" && (
          <Home
            onNavigateToRequest={() => setCurrentScreen("request")}
            onNavigateToMatch={() => setCurrentScreen("match")}
          />
        )}

        {currentScreen === "request" && (
          <RequestForm
            onMatchFound={handleMatchFound}
            onCancel={() => setCurrentScreen("home")}
          />
        )}

        {currentScreen === "match" && (
          <MatchConfirmation
            matchGroup={activeMatchGroup}
            userName={currentUserName}
            onBack={() => setCurrentScreen("home")}
            onDone={() => setCurrentScreen("home")}
          />
        )}
      </main>

      {/* Shared Footer */}
      <footer className="lmc-footer">
        <p>LastMileConnect • Smart Metro Auto Pooling • Built for Hackathon 2026</p>
      </footer>
    </div>
  );
}

export default App;
