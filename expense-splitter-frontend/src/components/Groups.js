import React from "react";
import NewGroupForm from "./NewGroupForm";

function Groups({ groups, users, onSelectGroup, onDeleteGroup, onGroupCreated }) {
  return (
    <div>
      <h2>Groups</h2>
      <NewGroupForm users={users} onGroupCreated={onGroupCreated} />
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <button onClick={() => onSelectGroup(group)}>{group.name}</button>
            <button onClick={() => onDeleteGroup(group.id)} style={{ marginLeft: "1rem" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Groups;
