// src/components/Dashboard.js
import { useNavigate } from "react-router-dom";

function Dashboard({ currentUser }) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome, {currentUser.name}</h1>
      <p>Email: {currentUser.email}</p>
      {/* Add user balance if you calculate it on backend */}
      <button onClick={() => navigate("/users")}>View/Add Users</button>
      <button onClick={() => navigate("/groups")}>View/Add Groups</button>
    </div>
  );
}

export default Dashboard;
