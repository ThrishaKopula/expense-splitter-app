import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";

function Login({ setCurrentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser({ email, password });
      setCurrentUser(user); 
      console.log(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Email not found frontend");
    }
  };

  return (
    <div className="centered-page">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <div className="switch-link">
          Don't have an account? <span onClick={() => navigate("/signup")} style={{color:'blue', cursor:'pointer'}}>Sign Up</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
