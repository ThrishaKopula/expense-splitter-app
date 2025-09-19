import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

function NewUserForm({ onUserCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/users`, { name, email, password })
      .then(res => {
        alert("User created!");
        onUserCreated(res.data); // notify parent
        setName(""); setEmail(""); setPassword("");
      })
      .catch(err => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create User</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Create User</button>
    </form>
  );
}

export default NewUserForm;
