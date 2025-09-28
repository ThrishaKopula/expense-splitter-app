import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/api";
import { useEffect } from "react";
import axios from "axios";


function Login({ setCurrentUser }) {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // const [currData, setCurrData] = useState(null);
  const [googleUserData, setGoogleUserData] = useState(null); 
  const navigate = useNavigate();


  useEffect(() => {
       axios.get('http://localhost:8080/api/user-info', { withCredentials: true })
        .then(response => {
             const userData = response.data;
             if (userData.error === "User not authenticated") {
                 // The backend session is gone. Clear local state and redirect to login.
                 setCurrentUser(null);
                 localStorage.removeItem("currentUser");
                 navigate("/login", { replace: true });
                 return; // Stop further processing
             }
             setGoogleUserData(userData); 
             console.log('Logged in user data:', googleUserData.name);
            //  setCurrentUser(loguser); 
            })

        .catch(error => { console.error('Error fetching user info:', error); });
  }, []);

  useEffect(() => {
      if (googleUserData) {
          console.log("Google user data available:", googleUserData);
          
          const autoLoginSignup = async () => {
              try {
                  // This is the core action: use the signup endpoint to either
                  // create the user or log them in (if the user already exists, per your API logic).
                  const user = await signupUser({ 
                      name: googleUserData.name, 
                      email: googleUserData.email,
                  });
                  
                  // Success: Set user state and redirect
                  setCurrentUser(user);
                  navigate("/dashboard");
              } catch (err) {
                  setError("Failed to auto-login/signup with Google data.");
                  console.error("Signup/Login Error:", err);
              }
          };

          autoLoginSignup();
      }
  }, [googleUserData, setCurrentUser, navigate]);



  const googleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  }

  return (
    <div className="centered-page">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form>
          {/* <input
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
          <button type="submit">Login</button> */}
          <button type="button" onClick={googleLogin} style={{marginTop: '10px', backgroundColor: '#4285F4', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer'}}>
            Login with Google
          </button>
        </form>
        {/* <div className="switch-link">
          Don't have an account? <span onClick={() => navigate("/signup")} style={{color:'blue', cursor:'pointer'}}>Sign Up</span>
        </div> */}
      </div>
    </div>
  );
}

export default Login;
