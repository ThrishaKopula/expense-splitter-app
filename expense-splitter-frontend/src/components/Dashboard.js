// src/components/Dashboard.js
import { useNavigate } from "react-router-dom";

function Dashboard({ user }) {
  const navigate = useNavigate();
  if (!user) {
    return <p>Loading user data...</p>; // or redirect to login
  }

  return (
    <div className="container">
      <h1>Welcome, {user.name}</h1>
      <div className="card">
        <h2>Balance</h2>
        <p>${user.balance || 0}</p>
      </div>

      <div className="header-buttons">
        <button onClick={() => navigate("/users")}>View / Add Users</button>
        <button onClick={() => navigate("/groups")}>View / Add Groups</button>
      </div>
    </div>
  );
}

export default Dashboard;
