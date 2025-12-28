import React, { useState } from "react";
import axiosClient from "../apis/axiosClient";
import { useNavigate } from "react-router-dom";
import "../public/css/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosClient.post("/auth/login", {
      username,
      password,
    });

    // ✅ Store userId safely (non-sensitive)
    localStorage.setItem("userId", res.data.user.id);
    localStorage.setItem("workspaceId", res.data.workspace?.id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
      console.error(err);
    }
  };

  return (
    <div className="login_body">
      <div className="wrapper">
        <h1>Login</h1>
        {error && <p className="error_message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input_box">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input_box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn">
            Login
          </button>
        </form>

        <div className="signUp_link">
          <p>
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
