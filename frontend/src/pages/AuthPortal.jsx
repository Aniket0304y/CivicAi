import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";

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

  // Reset input fields when toggling between login/register
  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setMessage("");
  }, [isLogin]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      const user = res.data;

      if (user.role !== role) {
        setError(`❌ You are not authorized to log in as ${role}.`);
        return;
      }

      localStorage.setItem("userInfo", JSON.stringify(user));
      // after successful login:
if (user.role === "admin") navigate("/complaints");
else navigate("/"); // NOT "/dashboard" — your App uses "/"


    } catch (err) {
      setError("❌ Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      setMessage("✅ Registration successful! Redirecting...");
      setTimeout(() => setIsLogin(true), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${!isLogin ? "slide-active" : ""}`}>
      {/* ===== Login Section ===== */}
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

      {/* ===== Register Section ===== */}
      <div className="form-section register-section">
        <h2 className="auth-title">Create Account ✨</h2>
        <p className="auth-subtitle">Join CivicAI to make a difference</p>

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
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {message && (
          <p style={{ color: "#4ade80", textAlign: "center" }}>{message}</p>
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
