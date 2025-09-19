// src/App.js
import { useState } from "react";
import Users from "./components/Users";
import Groups from "./components/Groups";
import Expenses from "./components/Expenses";
import NewUserForm from "./components/newUserForm"; 
import NewGroupForm from "./components/NewGroupForm";


function App() {
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Expense Splitter</h1>
      <NewUserForm />
      <Users />

      <NewGroupForm />
      <Groups onSelectGroup={setSelectedGroup} />
      {selectedGroup && <Expenses group={selectedGroup} />}
    </div>
  );
}

export default App;
