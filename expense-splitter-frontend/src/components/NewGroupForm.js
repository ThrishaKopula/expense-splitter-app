import React, { useState } from "react";
import axios from "axios";
const API_BASE_URL = "http://localhost:8080/api";

function NewGroupForm({ users, onGroupCreated }) {
  const [name, setName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/groups`, {
        name,
        userIds: selectedUserIds,
      });
      setName("");
      setSelectedUserIds([]);
      onGroupCreated();
    } catch (err) {
      console.error("Error creating group:", err.response?.data || err.message);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create New Group</h3>
      <input
        type="text"
        placeholder="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div>
        <h4>Select Users:</h4>
        {users.map((u) => (
          <label key={u.id}>
            <input
              type="checkbox"
              checked={selectedUserIds.includes(u.id)}
              onChange={() => toggleUser(u.id)}
            />
            {u.name} ({u.email})
          </label>
        ))}
      </div>
      <button type="submit">Create Group</button>
    </form>
  );
}

export default NewGroupForm;
