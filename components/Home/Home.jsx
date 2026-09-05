import React from "react";
import "./Home.css";

/**
 * Home / Landing Page Component for LastMileConnect
 * 
 * @param {Object} props
 * @param {Function} props.onRequestRide - Callback invoked when the user clicks 'Request a Ride'
 */
export default function Home({ onRequestRide }) {
  const features = [
    {
      icon: "⚡",
      title: "Instant Matching",
      desc: "Get paired in seconds with commuters exiting your metro/train station heading to the same tech park or neighborhood."
    },
    {
      icon: "💰",
      title: "Split Fares 50–70%",
      desc: "Turn a ₹120 solo auto ride into ₹40–₹60 per person by sharing with verified co-commuters."
    },
    {
      icon: "🌱",
      title: "Greener Commute",
      desc: "Reduce last-mile congestion, traffic choke points at transit exits, and urban emissions."
    },
    {
      icon: "🛡️",
      title: "Designated Station Pickups",
      desc: "Meet conveniently at pre-assigned station gates and auto stands without any confusion."
    }
  ];

  const sampleStations = [
    { name: "Indiranagar Metro", status: "Active Hub", matches: "12 matches in last 10 min" },
    { name: "MG Road Metro", status: "High Demand", matches: "8 matches in last 10 min" },
    { name: "Majestic Kempegowda", status: "Active Hub", matches: "19 matches in last 10 min" },
    { name: "HSR Layout Metro", status: "Fast Matching", matches: "15 matches in last 10 min" }
  ];

  return (
    <div className="lmc-home-container">
      {/* Navigation Bar */}
      <header className="lmc-navbar">
        <div className="lmc-brand">
          <div className="lmc-brand-icon">🛺</div>
          <div className="lmc-brand-text">
            <span className="lmc-logo-name">LastMile<span className="lmc-accent">Connect</span></span>
            <span className="lmc-badge">Hackathon Demo</span>
          </div>
        </div>
        <div className="lmc-nav-actions">
          <button 
            type="button" 
            className="lmc-btn lmc-btn-primary lmc-btn-nav"
            onClick={onRequestRide}
          >
            Request a Ride
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="lmc-hero">
        <div className="lmc-hero-content">
          <div className="lmc-hero-pill">
            <span className="lmc-pulse-dot"></span>
            Smart Transit Station Co-Riding
          </div>
          <h1 className="lmc-hero-title">
            Share the Auto, <br />
            <span className="lmc-gradient-text">Split the Fare.</span>
          </h1>
          <p className="lmc-hero-subtitle">
            Arrived at the metro or train station? Match with commuters heading in your exact direction. 
            Hop in an auto or e-rickshaw together and stop paying full fare solo.
          </p>

          <div className="lmc-hero-cta-group">
            <button 
              type="button" 
              className="lmc-btn lmc-btn-primary lmc-btn-large lmc-glow-btn"
              onClick={onRequestRide}
            >
              <span className="lmc-btn-icon">🚀</span>
              Request a Ride Now
            </button>
            <div className="lmc-micro-stat">
              <span>⏱️ Average match time: <strong>&lt; 45 seconds</strong></span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="lmc-hero-card-wrapper">
          <div className="lmc-preview-card">
            <div className="lmc-card-header">
              <span className="lmc-card-dot red"></span>
              <span className="lmc-card-dot yellow"></span>
              <span className="lmc-card-dot green"></span>
              <span className="lmc-card-title">Live LastMile Matching</span>
            </div>

            <div className="lmc-card-body">
              <div className="lmc-route-chip">
                <span className="lmc-route-tag">From</span>
                <strong>Indiranagar Metro Station (Exit 1)</strong>
              </div>
              <div className="lmc-route-arrow">⬇️ Heading to same destination zone</div>
              <div className="lmc-route-chip destination">
                <span className="lmc-route-tag">To</span>
                <strong>Koramangala Block 4</strong>
              </div>

              <div className="lmc-fare-comparison">
                <div className="lmc-fare-box solo">
                  <span className="label">Solo Auto Fare</span>
                  <span className="amount strike">₹120</span>
                </div>
                <div className="lmc-fare-arrow">➡️</div>
                <div className="lmc-fare-box shared">
                  <span className="label">Shared Fare (3 Riders)</span>
                  <span className="amount highlight">₹40 <small>/ person</small></span>
                </div>
              </div>

              <div className="lmc-card-footer-info">
                <span>🛡️ Safe • Verified Auto Stands • Zero Surge</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="lmc-how-it-works">
        <h2 className="lmc-section-title">How LastMileConnect Works</h2>
        <p className="lmc-section-subtitle">3 simple steps from station exit to doorstep</p>

        <div className="lmc-steps-grid">
          <div className="lmc-step-card">
            <div className="lmc-step-number">1</div>
            <div className="lmc-step-icon">🚉</div>
            <h3>Select Your Station</h3>
            <p>Pick your current transit exit hub (metro, local train, or bus terminal).</p>
          </div>

          <div className="lmc-step-card">
            <div className="lmc-step-number">2</div>
            <div className="lmc-step-icon">📍</div>
            <h3>Pick Destination Zone</h3>
            <p>Select your office tech park, layout, or residential sector.</p>
          </div>

          <div className="lmc-step-card">
            <div className="lmc-step-number">3</div>
            <div className="lmc-step-icon">🤝</div>
            <h3>Meet &amp; Split Fare</h3>
            <p>Get matched instantly, meet at the designated auto stand, and split the meter.</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="lmc-features">
        <h2 className="lmc-section-title">Why Commuters Love It</h2>
        <div className="lmc-features-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="lmc-feature-card">
              <div className="lmc-feature-icon">{feat.icon}</div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Stations Demo Bar */}
      <section className="lmc-stations-ticker">
        <div className="lmc-ticker-title">
          <span>🟢 Live Station Hubs Supported</span>
        </div>
        <div className="lmc-ticker-grid">
          {sampleStations.map((station, idx) => (
            <div key={idx} className="lmc-station-badge">
              <span className="station-icon">🚇</span>
              <div className="station-info">
                <strong>{station.name}</strong>
                <small>{station.matches}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="lmc-footer">
        <div className="lmc-footer-content">
          <h3>Ready for a smarter last-mile commute?</h3>
          <p>Join commuters saving time and money at transit hubs every day.</p>
          <button 
            type="button" 
            className="lmc-btn lmc-btn-primary lmc-btn-large"
            onClick={onRequestRide}
          >
            Start Your Ride Request
          </button>
        </div>
        <div className="lmc-footer-bottom">
          <p>© {new Date().getFullYear()} LastMileConnect • Built for Transit Hackathon</p>
        </div>
      </footer>
    </div>
  );
}
