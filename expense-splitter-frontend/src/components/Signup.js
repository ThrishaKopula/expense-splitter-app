// src/components/Signup.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUsers, createUser } from "../api/api";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const users = await getUsers();
      if (users.some((u) => u.email === email)) {
        setError("Email already registered. Please login.");
        return;
      }

      await createUser({ name, email });
      navigate("/login");
    } catch {
      setError("Signup failed. Try again later.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;
