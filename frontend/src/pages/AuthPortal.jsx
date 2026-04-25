import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";

// ✅ Base API (IMPORTANT)
const API = "https://civicai-1-u7ws.onrender.com";

function AuthPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reset input fields
  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setMessage("");
  }, [isLogin]);

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      const user = res.data;

      // ✅ store user
      localStorage.setItem("userInfo", JSON.stringify(user));

      // ✅ role-based navigation
      if (user.role === "admin") {
        navigate("/complaints");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("❌ Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await axios.post(`${API}/api/auth/register`, {
        name,
        email,
        password,
      });

      setMessage("✅ Registration successful! Redirecting...");

      setTimeout(() => {
        setIsLogin(true);
      }, 1500);

    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "❌ Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${!isLogin ? "slide-active" : ""}`}>

      {/* ===== LOGIN ===== */}
      <div className="form-section login-section">
        <h2 className="auth-title">Welcome Back 👋</h2>
        <p className="auth-subtitle">Login to continue to CivicAI</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Login As:</label>
          <div className="role-select">
            <label>
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={(e) => setRole(e.target.value)}
              />
              User
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={(e) => setRole(e.target.value)}
              />
              Admin
            </label>
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        <p className="switch-text">
          Don’t have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </p>
      </div>

      {/* ===== REGISTER ===== */}
      <div className="form-section register-section">
        <h2 className="auth-title">Create Account ✨</h2>
        <p className="auth-subtitle">Join CivicAI</p>

        <form onSubmit={handleRegister}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        {message && (
          <p style={{ color: "#4ade80", textAlign: "center" }}>
            {message}
          </p>
        )}

        {error && <p className="error-msg">{error}</p>}

        <p className="switch-text">
          Already have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
        </p>
      </div>

    </div>
  );
}

export default AuthPortal;