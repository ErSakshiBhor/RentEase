import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link
        to={role === "tenant" ? "/tenant-dashboard" : "/dashboard"}
        className="navbar-brand"
        onClick={closeMenu}
      >
        <div className="brand-icon">R</div>
        <span>RentEase</span>
      </Link>

      {/* Hamburger Button - Mobile Only */}
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {/* Navigation Menu */}
      <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>

        {/* Owner Navigation */}
        {role === "owner" && (
          <div className="nav-links">

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/properties"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              Properties
            </NavLink>

            <NavLink
              to="/units"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              Units
            </NavLink>

            <NavLink
              to="/tenants"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              Tenants
            </NavLink>

            <NavLink
              to="/agreements"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              Agreements
            </NavLink>

            <NavLink
              to="/payments"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              Payments
            </NavLink>

          </div>
        )}

        {/* Tenant Navigation */}
        {role === "tenant" && (
          <div className="nav-links">

            <NavLink
              to="/tenant-dashboard"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/my-property"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              My Property
            </NavLink>

            <NavLink
              to="/my-agreement"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              My Agreement
            </NavLink>

            <NavLink
              to="/my-payments"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              onClick={closeMenu}
            >
              My Payments
            </NavLink>

          </div>
        )}

        {/* Logout */}
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
};

export default Navbar;