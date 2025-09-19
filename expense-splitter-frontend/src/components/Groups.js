// src/components/Groups.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroups, createGroup } from "../api/api";
import { useState } from "react";

function Groups({ currentUser }) {
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState("");
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const handleCreateGroup = () => {
    if (!groupName) return;
    mutation.mutate({
      name: groupName,
      userIds: [currentUser.id], // current user is automatically in group
    });
    setGroupName("");
  };

  if (isLoading) return <p>Loading groups...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Groups</h2>
      <input
        type="text"
        placeholder="New Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button onClick={handleCreateGroup}>Create Group</button>

      <ul>
        {groups.map((g) => (
          <li key={g.id}>{g.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Groups;
