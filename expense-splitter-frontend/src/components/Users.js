import React from "react";
import NewUserForm from "./newUserForm";

function Users({ users, onDeleteUser, onUserCreated }) {
  return (
    <div>
      <h2>Users</h2>
      <NewUserForm onUserCreated={onUserCreated} />
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => onDeleteUser(user.id)} style={{ marginLeft: "1rem" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
