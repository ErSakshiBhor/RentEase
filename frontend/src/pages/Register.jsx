import React, { useState } from "react";
import api from "../services/api";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("owner");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      console.log(response.data);

      alert("Registration successful!");

      setName("");
      setEmail("");
      setPassword("");
      setRole("owner");

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">

      <div className="register-left">
        <div className="brand">
          <div className="brand-icon">R</div>
          <h2>RentEase</h2>
        </div>

        <div className="register-content">
          <h1>
            Start managing
            <span> with ease.</span>
          </h1>

          <p>
            Create your RentEase account and manage
            your properties, tenants and agreements easily.
          </p>
        </div>
      </div>

      <div className="register-right">
        <div className="register-card">

          <h1>Create Account ✨</h1>

          <p className="register-subtitle">
            Join RentEase today
          </p>

          <form onSubmit={handleRegister}>

            <div className="input-group">
              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Role</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="owner">Owner</option>
                <option value="tenant">Tenant</option>
              </select>
            </div>

            <button type="submit">
              Create Account
            </button>

          </form>

        </div>
      </div>

    </div>
  );
};

export default Register;