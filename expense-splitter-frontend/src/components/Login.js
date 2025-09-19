// src/components/Login.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUsers } from "../api/api";

function Login({ setCurrentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const users = await getUsers();
      const user = users.find((u) => u.email === email);

      if (!user) {
        setError("Email not registered. Please sign up first.");
        return;
      }

      setCurrentUser(user);
      navigate("/dashboard");
    } catch {
      setError("Login failed. Try again later.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;
