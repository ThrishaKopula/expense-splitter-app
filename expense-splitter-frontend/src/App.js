// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Groups from "./components/Groups";

const queryClient = new QueryClient();

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={currentUser ? "/dashboard" : "/login"} />}
          />
          <Route
            path="/login"
            element={<Login setCurrentUser={setCurrentUser} />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              currentUser ? <Dashboard currentUser={currentUser} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/users"
            element={currentUser ? <Users /> : <Navigate to="/login" />}
          />
          <Route
            path="/groups"
            element={currentUser ? <Groups currentUser={currentUser} /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
