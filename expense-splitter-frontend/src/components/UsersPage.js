// src/components/UsersPage.js
import Users from "./Users";
import { useNavigate } from "react-router-dom";

function UsersPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "1rem" }}>
        Back to Dashboard
      </button>
      <Users />
    </div>
  );
}

export default UsersPage;
