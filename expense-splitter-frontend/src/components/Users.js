// src/components/Users.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, deleteUser } from "../api/api";

function Users() {
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Create user
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Delete user
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error fetching users: {error.message}</p>;

  return (
    <div>
      <h2>Users</h2>
      <button
        onClick={() =>
          createMutation.mutate({
            name: `User ${users.length + 1}`,
            email: `user${users.length + 1}@test.com`,
          })
        }
      >
        Add Test User
      </button>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} ({u.email})
            <button onClick={() => deleteMutation.mutate(u.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
