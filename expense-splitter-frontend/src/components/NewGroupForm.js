import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup } from "../api/api";

function NewGroupForm({ users }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(["groups"]);
      setName("");
      setSelectedUserIds([]);
    },
  });

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    mutation.mutate({ name, userIds: selectedUserIds });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <h3>Create Group</h3>
      <input placeholder="Group Name" value={name} onChange={(e) => setName(e.target.value)} />
      <div>
        {users?.map((user) => (
          <label key={user.id} style={{ marginRight: "1rem" }}>
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
      <button type="submit">{mutation.isLoading ? "Creating..." : "Create Group"}</button>
    </form>
  );
}

export default NewGroupForm;
