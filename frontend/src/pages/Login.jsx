import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("https://civicai-10cr.onrender.com/api/auth/login", {
        email,
        password,
      });

      const user = res.data;

      if (user.role !== role) {
        setError(`❌ You are not authorized to log in as ${role}.`);
        return;
      }

      localStorage.setItem("userInfo", JSON.stringify(user));

      if (user.role === "admin") navigate("/complaints");
      else navigate("/form");
    } catch (err) {
      console.error("Login Error:", err);
      setError("❌ Invalid email or password");
    }
  };

  return (
    
    <div className="form-card">
      <h2>Login</h2>

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

        <button type="submit" className="btn-primary">
          Login
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <p style={{ marginTop: "15px" }}>
        Don’t have an account?{" "}
        <a href="/register" style={{ color: "#0b5cff" }}>
          Sign Up
        </a>
      </p>
    </div>

  );
}

export default Login;
