// src/components/Users.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, deleteUser } from "../api/api";
import { useState } from "react";

function Users() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const addMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  if (isLoading) return <p>Loading users...</p>;

  return (
    <div className="container">
      <div className="card">
        <h2>Add User</h2>
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={() => addMutation.mutate({ email })}>Add User</button>
      </div>

      <div className="card">
        <h2>Existing Users</h2>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              <span>{u.name} ({u.email})</span>
              <button onClick={() => deleteMutation.mutate(u.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Users;
