// src/components/Groups.js
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroups, createGroup, deleteGroup } from "../api/api";

function Groups({ onSelectGroup }) {
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState("");

  // Fetch groups
  const { data: groups = [], error, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  // Create group
  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setGroupName("");
    },
  });

  // Delete group
  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  if (isLoading) return <p>Loading groups...</p>;
  if (error) return <p>Error fetching groups: {error.message}</p>;

  return (
    <div>
      <h2>Groups</h2>

      {/* <input
        type="text"
        placeholder="New group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button
        onClick={() => {
          if (groupName.trim()) {
            createMutation.mutate({ name: groupName });
          }
        }}
      >
        Add Group
      </button> */}

      <ul>
        {groups.map((g) => (
          <li key={g.id}>
            <button onClick={() => onSelectGroup(g)}>{g.name}</button>
            <button onClick={() => deleteMutation.mutate(g.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Groups;
