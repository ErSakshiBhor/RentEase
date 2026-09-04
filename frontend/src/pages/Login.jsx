import React, { useState } from "react";
import api from "../services/api";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log(response.data);

      localStorage.setItem("token", response.data.access_token);

      alert("Login successful!");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="brand">
          <div className="brand-icon">R</div>
          <h2>RentEase</h2>
        </div>

        <div className="welcome-content">
          <h1>
            Manage your property,
            <span> with ease.</span>
          </h1>

          <p>
            A simple and smart way to manage properties,
            tenants, units and rental agreements.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">

          <h1>Welcome Back 👋</h1>

          <p className="login-subtitle">
            Login to your RentEase account
          </p>

          <form onSubmit={handleLogin}>

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit">
              Login
            </button>
            <p>Don't have account? Click here</p>

          </form>

        </div>
      </div>

    </div>
  );
};

export default Login;