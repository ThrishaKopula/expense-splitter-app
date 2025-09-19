import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

function NewGroupForm({ onGroupCreated }) {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    // fetch all users
    axios.get(`${API_BASE_URL}/users`)
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/groups`, { name, userIds: selectedUserIds })
      .then(res => {
        alert("Group created!");
        onGroupCreated(res.data);
        setName(""); setSelectedUserIds([]);
      })
      .catch(err => console.error(err));
  };

  const toggleUser = (id) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Group</h3>
      <input
        type="text"
        placeholder="Group Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <div>
        {users.map(user => (
          <label key={user.id}>
            <input
              type="checkbox"
              value={user.id}
              checked={selectedUserIds.includes(user.id)}
              onChange={() => toggleUser(user.id)}
            />
            {user.name}
          </label>
        ))}
      </div>
      <button type="submit">Create Group</button>
    </form>
  );
}

export default NewGroupForm;
