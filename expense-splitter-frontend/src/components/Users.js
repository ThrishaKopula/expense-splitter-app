import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  // Create a new user
  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/users`, {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
      });
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      fetchUsers(); // refresh list
    } catch (err) {
      console.error("Error creating user:", err.response?.data || err.message);
    }
  };

  // Delete a user
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`);
      fetchUsers(); // refresh list
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Users</h2>

      <form onSubmit={createUser} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Name"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
          required
        />
        <button type="submit">Add User</button>
      </form>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button
              style={{ marginLeft: "1rem" }}
              onClick={() => deleteUser(user.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
