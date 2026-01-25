import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
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

      // Send to backend with special flag for Google OAuth
      const result = await fetch(
        "http://localhost:5001/api/auth/google-signup",
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
        throw new Error("Google signup failed");
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
      console.error("Google signup error:", err);
      setError("Google signup failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google signup failed. Please try again.");
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

        const googleBtn = document.getElementById("google-signup-btn");
        if (googleBtn && !googleBtn.querySelector(".g_id_signin")) {
          window.google.accounts.id.renderButton(googleBtn, {
            type: "standard",
            size: "large",
            text: "signup_with",
          });
        }
      }
    };

    // Wait for Google SDK to load
    const timer = setTimeout(initializeGoogleSignIn, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    // Call API through AuthContext
    register(form.email, form.name, form.password, form.confirmPassword)
      .then(() => {
        // Show success message
        setSuccess(true);
        setForm({ name: "", email: "", password: "", confirmPassword: "" });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      })
      .catch((err) => {
        // Error is already set in AuthContext, but set it locally too for display
        const errorMsg =
          err.message ||
          (typeof err === "object" && err.error) ||
          "Registration failed. Please try again.";
        setError(errorMsg);
        setLoading(false);
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">
          Join BioScout to track and explore biodiversity.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="auth-input"
              placeholder="Ayesha Khan"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

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

          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className="auth-input"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowConfirm((p) => !p)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success">
              ✓ Account created successfully! Redirecting to login...
            </div>
          )}

          <div className="auth-actions">
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
            <div id="google-signup-btn" className="google-signin-btn"></div>
          </div>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
