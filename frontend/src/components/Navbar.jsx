import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to="/dashboard" className="navbar-brand">
        <div className="brand-icon">R</div>
        <span>RentEase</span>
      </Link>

      {/* Navigation Links */}
      <div className="nav-links">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "active-link" : ""
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/properties"
          className={({ isActive }) =>
            isActive ? "active-link" : ""
          }
        >
          Properties
        </NavLink>

        <NavLink
          to="/units"
          className={({ isActive }) =>
            isActive ? "active-link" : ""
          }
        >
          Units
        </NavLink>

        <NavLink
          to="/tenants"
          className={({ isActive }) =>
            isActive ? "active-link" : ""
          }
        >
          Tenants
        </NavLink>

        <NavLink
          to="/agreements"
          className={({ isActive }) =>
            isActive ? "active-link" : ""
          }
        >
          Agreements
        </NavLink>

        <NavLink
          to="/payments"
          className={({ isActive }) =>
            isActive ? "active-link" : ""
          }
        >
          Payments
        </NavLink>

      </div>

      {/* Logout */}
      <button
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>

    </nav>
  );
};

export default Navbar;