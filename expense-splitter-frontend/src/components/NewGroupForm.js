// src/components/NewGroupForm.js
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGroup, getUsers } from "../api/api";

function NewGroupForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]); 

  // Fetch users directly here
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] }); // refresh groups
      setName("");
      setSelectedUserIds("");
    },
  });

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId) // uncheck
        : [...prev, userId] // check
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    mutation.mutate({
      name,
      userIds: selectedUserIds, // send array of selected user IDs
    });
  };

  if (isLoading) return <p>Loading users...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <h3>Create Group</h3>
      <input
        type="text"
        placeholder="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <h4>Select Users</h4>
        {users.map((user) => (
          <label key={user.id} style={{ display: "block" }}>
            <input
              type="checkbox"
              value={user.id}
              checked={selectedUserIds.includes(user.id)}
              onChange={() => handleCheckboxChange(user.id)}
            />
            {user.name}
          </label>
        ))}
      </div>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create Group"}
      </button>
    </form>
  );
}

export default NewGroupForm;
