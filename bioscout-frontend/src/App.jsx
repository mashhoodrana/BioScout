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
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddObservation = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
