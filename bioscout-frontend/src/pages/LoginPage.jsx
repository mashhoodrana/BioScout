import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Call API through AuthContext
    login(form.email, form.password)
      .then(() => {
        // Successfully logged in, will be redirected by useEffect
        navigate("/");
      })
      .catch((err) => {
        // Error is already set in AuthContext, but set it locally too for display
        const errorMsg =
          err.message ||
          (typeof err === "object" && err.error) ||
          "Login failed. Please check your credentials.";
        setError(errorMsg);
        setLoading(false);
      });
  };

  const handleGoogleSuccess = async (response) => {
    try {
      setLoading(true);
      setError("");

      // Extract user info from Google token
      const token = response.credential;

      // Decode JWT without verification (for frontend only)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const googleUser = JSON.parse(jsonPayload);

      // Send to backend
      const result = await fetch(
        "http://localhost:5001/api/auth/google-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: googleUser.email,
            name: googleUser.name,
            google_id: googleUser.sub,
          }),
        },
      );

      if (!result.ok) {
        throw new Error("Google login failed");
      }

      const data = await result.json();

      // Store token and redirect to map
      localStorage.setItem("bioscout_token", data.access_token);
      localStorage.setItem(
        "bioscout_user",
        JSON.stringify({
          id: data.user?.id,
          name: data.user?.name,
          email: data.user?.email,
        }),
      );

      // Redirect to map
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "511772806049-d2ul593buaf25f2u2gjg9scubrhfp1s0.apps.googleusercontent.com", // Replace with actual ID
          callback: handleGoogleSuccess,
        });

        const googleBtn = document.getElementById("google-login-btn");
        if (googleBtn && !googleBtn.querySelector(".g_id_signin")) {
          window.google.accounts.id.renderButton(googleBtn, {
            type: "standard",
            size: "large",
            text: "signin_with",
          });
        }
      }
    };

    // Wait for Google SDK to load
    const timer = setTimeout(initializeGoogleSignIn, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">
          Log in to continue exploring observations.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-actions">
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <div id="google-login-btn" className="google-signin-btn"></div>
          </div>
        </form>

        <div className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
