// src/components/NewUserForm.js
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/api";

function NewUserForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] }); // refresh users
      setName("");
      setEmail("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    mutation.mutate({ name, email });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <h3>Add User</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add User"}
      </button>
    </form>
  );
}

export default NewUserForm;
