// src/components/Users.js
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/api";
import { useState } from "react";

function Users() {
  const [emailToAdd, setEmailToAdd] = useState("");
  const { data: users = [], error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const handleAddUser = () => {
    const userExists = users.find((u) => u.email === emailToAdd);
    if (!userExists) {
      alert("User with this email does not exist");
      return;
    }
    // Add user to group/friends logic here
    alert(`Added user: ${userExists.name}`);
    setEmailToAdd("");
  };

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Users</h2>
      <input
        type="email"
        placeholder="Enter user email"
        value={emailToAdd}
        onChange={(e) => setEmailToAdd(e.target.value)}
      />
      <button onClick={handleAddUser}>Add User</button>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
