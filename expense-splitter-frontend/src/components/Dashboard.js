// src/components/Dashboard.js
import { useNavigate } from "react-router-dom";

function Dashboard({ user, setCurrentUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null); // clear user from state
    navigate("/login");   // redirect to login page
  };

  if (!user) {
    return <p>Loading user data...</p>; // or redirect to login
  }

  return (
    <div className="container">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
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
