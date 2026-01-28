// React hooks for component state management
import React, { useState } from "react";
// React Router components for navigation and location tracking
import { Link, useLocation } from "react-router-dom";
// Custom hook for accessing authentication context and user info
import { useAuth } from "../context/AuthContext";
// Component styles
import "./Header.css";

/**
 * Header Component
 *
 * Displays the main navigation header with:
 * - Logo/title
 * - Navigation links (Map, Add Observation, About, Chat)
 * - Authentication links or user menu (based on login status)
 * - Logout confirmation modal
 *
 * @param {Function} onAddObservation - Callback function triggered when "Add Observation" button is clicked
 */
const Header = ({ onAddObservation }) => {
  // Get the current URL location to highlight active navigation links
  const location = useLocation();

  // Destructure authentication context: isAuthenticated (boolean), user (object), logout (function)
  const { isAuthenticated, user, logout } = useAuth();

  // State to control visibility of the user dropdown menu
  const [showMenu, setShowMenu] = useState(false);

  // State to control visibility of the logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Handler to show the logout confirmation modal when logout button is clicked
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // Handler to confirm logout: closes modal, closes menu, and calls logout function
  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    setShowMenu(false);
    await logout();
  };

  // Handler to cancel logout: hides the confirmation modal
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <header className="header">
      {/* Logo section with app title */}
      <div className="logo">
        <h1>BioScout Islamabad</h1>
      </div>

      {/* Main navigation bar */}
      <nav>
        <ul>
          {/* Navigation links shown only when user is authenticated */}
          {isAuthenticated && (
            <>
              {/* Link to home/map page */}
              <li>
                <Link
                  to="/"
                  className={location.pathname === "/" ? "active" : ""}
                >
                  Map
                </Link>
              </li>

              {/* Button to trigger add observation modal/dialog */}
              <li>
                <button
                  onClick={onAddObservation}
                  className="add-observation-btn"
                >
                  Add Observation
                </button>
              </li>

              {/* Link to about page */}
              <li>
                <Link
                  to="/about"
                  className={location.pathname === "/about" ? "active" : ""}
                >
                  About
                </Link>
              </li>

              {/* Link to chat page */}
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

          {/* Authentication section: shows login/signup or user menu based on authentication status */}
          <li className="auth-links">
            {!isAuthenticated ? (
              /* Show login and signup buttons when user is not authenticated */
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
              /* Show user chip button and dropdown menu when user is authenticated */
              <div className="user-actions">
                {/* User chip button showing user initials and name */}
                <button
                  className="user-chip"
                  onClick={() => setShowMenu((s) => !s)}
                  onBlur={() => setShowMenu(false)}
                >
                  {/* Display first letter of user's name as initials */}
                  <span className="user-initials">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                  {/* Display user's name or email */}
                  <span className="user-name">
                    {user?.name || user?.email || "User"}
                  </span>
                  {/* Caret indicator for dropdown menu */}
                  <span className="user-caret">▾</span>
                </button>

                {/* Dropdown menu shown when user clicks the user chip button */}
                {showMenu && (
                  <div className="user-menu">
                    {/* User info header in dropdown menu */}
                    <div className="user-menu-header">
                      <div className="user-menu-name">
                        {user?.name || "User"}
                      </div>
                      <div className="user-menu-email">{user?.email || ""}</div>
                    </div>

                    {/* Logout button in dropdown menu */}
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

      {/* Logout confirmation modal overlay - shown when user clicks logout */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={handleCancelLogout}>
          {/* Modal dialog box with logout confirmation message and buttons */}
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              {/* Cancel button - dismisses the modal without logging out */}
              <button className="btn-cancel" onClick={handleCancelLogout}>
                Cancel
              </button>
              {/* Confirm logout button - logs out the user */}
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

// Export the Header component as default export
export default Header;
