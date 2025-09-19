// src/components/GroupsPage.js
import Groups from "./Groups";
import { useNavigate } from "react-router-dom";

function GroupsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "1rem" }}>
        Back to Dashboard
      </button>
      <Groups />
    </div>
  );
}

export default GroupsPage;
