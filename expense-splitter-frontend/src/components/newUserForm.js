import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const NewUserForm = ({ onUserCreated }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/users`, {
        name,
        email,
        password,
      });
      console.log("User created:", response.data);

      // Clear form
      setName("");
      setEmail("");
      setPassword("");

      // Notify parent component (optional)
      if (onUserCreated) onUserCreated(response.data);
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div>
      <h3>Create New User</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default NewUserForm;
