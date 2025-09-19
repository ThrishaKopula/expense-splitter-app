import React, { useState } from "react";
import axios from "axios";

function NewGroupForm({ onGroupCreated }) {
  const [name, setName] = useState("");
  const [userIds, setUserIds] = useState(""); // comma-separated

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name,
        userIds: userIds.split(",").map((id) => parseInt(id.trim(), 10)),
      };

      const res = await axios.post("http://localhost:8080/api/groups", payload);
      onGroupCreated(res.data);
      setName("");
      setUserIds("");
    } catch (err) {
      console.error("Error creating group:", err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create New Group</h3>
      <input
        type="text"
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="User IDs (comma separated)"
        value={userIds}
        onChange={(e) => setUserIds(e.target.value)}
        required
      />
      <button type="submit">Create Group</button>
    </form>
  );
}

export default NewGroupForm;
