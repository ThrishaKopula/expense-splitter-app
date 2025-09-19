import React from "react";
import Groups from "./components/Groups";
import NewUserForm from "./components/newUserForm";
import NewGroupForm from "./components/NewGroupForm";
import NewExpenseForm from "./components/NewExpenseForm";

function App() {
  return (
    <div className="App">
      <h1>Expense Splitter</h1>
      <NewUserForm onUserCreated={() => {}} />
      <NewGroupForm onGroupCreated={() => {}} />
      <NewExpenseForm onExpenseCreated={() => {}} />
      <Groups />
    </div>
  );
}

export default App;
