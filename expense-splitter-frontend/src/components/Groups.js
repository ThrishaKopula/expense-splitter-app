// src/components/Groups.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroups, createGroup, deleteGroup } from "../api/api";
import { useState } from "react";

function Groups() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  if (isLoading) return <p>Loading groups...</p>;

  return (
    <div className="container">
      <div className="card">
        <h2>Create Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={() => createMutation.mutate({ name, userIds: [] })}>
          Create Group
        </button>
      </div>

      <div className="card">
        <h2>Groups</h2>
        <ul>
          {groups.map((g) => (
            <li key={g.id}>
              <span>{g.name}</span>
              <button onClick={() => deleteMutation.mutate(g.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Groups;
