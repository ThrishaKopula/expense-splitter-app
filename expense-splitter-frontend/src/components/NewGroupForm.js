// src/components/NewGroupForm.js
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
      queryClient.invalidateQueries({ queryKey: ["groups"] });
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
    if (!name) return alert("Enter group name");
    mutation.mutate({ name, userIds: selectedUserIds });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Group</h3>
      <input
        type="text"
        placeholder="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div style={{ marginTop: "0.5rem" }}>
        {users?.map((user) => (
          <label key={user.id} style={{ display: "block" }}>
            <input
              type="checkbox"
              value={user.id}
              checked={selectedUserIds.includes(user.id)}
              onChange={() => toggleUser(user.id)}
            />{" "}
            {user.name}
          </label>
        ))}
      </div>

      <button type="submit" disabled={mutation.isLoading} style={{ marginTop: "0.5rem" }}>
        {mutation.isLoading ? "Creating..." : "Create Group"}
      </button>
    </form>
  );
}

export default NewGroupForm;
