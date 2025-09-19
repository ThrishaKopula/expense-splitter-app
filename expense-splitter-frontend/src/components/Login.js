// src/components/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        setError("Email not registered");
        return;
      }
      setCurrentUser(user);
      navigate("/dashboard");
    } catch {
      setError("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
