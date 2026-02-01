import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import ObservationModal from "./components/ObservationModal";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatHistoryProvider } from "./context/ChatHistoryContext";
import "./App.css";

/**
 * Main App Component
 * Handles routing and global state
 */

/**
 * PrivateRoute Component
 * Protects routes by redirecting unauthenticated users to login page
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  // State to control the visibility of the observation modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Key used to trigger re-render of HomePage after new observation is added
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Opens the observation modal for adding a new observation
   */
  const handleAddObservation = () => {
    setIsModalOpen(true);
  };

  /**
   * Closes the observation modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /**
   * Handles successful observation submission
   * Refreshes the observations list and shows success message
   * @param {Object} newObservation - The newly created observation data
   */
  const handleObservationSuccess = (newObservation) => {
    console.log("New observation created:", newObservation);
    // Trigger refresh of observations
    setRefreshKey((prev) => prev + 1);
    // Could show a success notification here
    alert("Observation submitted successfully!");
  };

  return (
    <AuthProvider>
      <ChatHistoryProvider>
        <Router>
          <div className="App">
            <Header onAddObservation={handleAddObservation} />

            <main>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <HomePage key={refreshKey} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <PrivateRoute>
                      <AboutPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <PrivateRoute>
                      <ChatPage />
                    </PrivateRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Routes>
            </main>

            <ObservationModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSuccess={handleObservationSuccess}
            />
          </div>
        </Router>
      </ChatHistoryProvider>
    </AuthProvider>
  );
}

export default App;
