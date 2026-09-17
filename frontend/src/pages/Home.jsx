import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      <nav className="home-navbar">
        <div className="home-logo">
          Rent<span>Ease</span>
        </div>

        <div className="home-nav-buttons">
          <button
            className="home-login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="home-register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </nav>

      <section className="hero-section">

        <div className="hero-content">
          <p className="hero-tagline">SMART RENTAL MANAGEMENT</p>

          <h1>
            Manage Your Rentals
            <br />
            <span>With Ease.</span>
          </h1>

          <p className="hero-description">
            RentEase helps property owners manage properties, units,
            tenants, rental agreements, and payments — all in one place.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-hero-btn"
              onClick={() => navigate("/login")}
            >
              Get Started
            </button>

            <button
              className="secondary-hero-btn"
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="hero-card">

          <div className="hero-card-header">
            <span>Rental Overview</span>
            <span className="overview-dot"></span>
          </div>

          <div className="overview-item">
            <div className="overview-icon property-bg">🏢</div>
            <div>
              <h4>Properties</h4>
              <p>Manage your properties</p>
            </div>
          </div>

          <div className="overview-item">
            <div className="overview-icon tenant-bg">👥</div>
            <div>
              <h4>Tenants</h4>
              <p>Keep tenant records organized</p>
            </div>
          </div>

          <div className="overview-item">
            <div className="overview-icon payment-bg">💰</div>
            <div>
              <h4>Payments</h4>
              <p>Track rent and collections</p>
            </div>
          </div>

          <div className="overview-item">
            <div className="overview-icon agreement-bg">📄</div>
            <div>
              <h4>Agreements</h4>
              <p>Manage rental agreements</p>
            </div>
          </div>

        </div>

      </section>

      <section className="features-section">

        <div className="feature-card">
          <div className="feature-icon">🏠</div>
          <h3>Property Management</h3>
          <p>
            Easily manage properties and rental units from one place.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Tenant Management</h3>
          <p>
            Organize tenant information and unit assignments efficiently.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>Payment Tracking</h3>
          <p>
            Track rent payments and monitor your rental collections.
          </p>
        </div>

      </section>

    </div>
  );
};

export default Home;