import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

/**
 * Header Component
 */
const Header = ({ onAddObservation }) => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    setShowMenu(false);
    await logout();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>BioScout Islamabad</h1>
      </div>
      <nav>
        <ul>
          {isAuthenticated && (
            <>
              <li>
                <Link
                  to="/"
                  className={location.pathname === "/" ? "active" : ""}
                >
                  Map
                </Link>
              </li>
              <li>
                <button
                  onClick={onAddObservation}
                  className="add-observation-btn"
                >
                  Add Observation
                </button>
              </li>
              <li>
                <Link
                  to="/about"
                  className={location.pathname === "/about" ? "active" : ""}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
                  className={location.pathname === "/chat" ? "active" : ""}
                >
                  Chat
                </Link>
              </li>
            </>
          )}

          <li className="auth-links">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className={`auth-btn-link ${location.pathname === "/login" ? "active" : ""}`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`auth-btn-link primary ${location.pathname === "/signup" ? "active" : ""}`}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="user-actions">
                <button
                  className="user-chip"
                  onClick={() => setShowMenu((s) => !s)}
                  onBlur={() => setShowMenu(false)}
                >
                  <span className="user-initials">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                  <span className="user-name">
                    {user?.name || user?.email || "User"}
                  </span>
                  <span className="user-caret">▾</span>
                </button>

                {showMenu && (
                  <div className="user-menu">
                    <div className="user-menu-header">
                      <div className="user-menu-name">
                        {user?.name || "User"}
                      </div>
                      <div className="user-menu-email">{user?.email || ""}</div>
                    </div>
                    <button
                      className="user-menu-item"
                      onMouseDown={handleLogoutClick}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        </ul>
      </nav>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={handleCancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={handleCancelLogout}>
                Cancel
              </button>
              <button
                className="btn-confirm-logout"
                onClick={handleConfirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
