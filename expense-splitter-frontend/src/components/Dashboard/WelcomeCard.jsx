// src/components/Dashboard/WelcomeCard.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

function WelcomeCard({ user, onLogout }) {
    return (
        <div className="dashboard-card" style={{ position: "relative" }}>
            <h2>Welcome, {user.name}</h2>
            <button
                onClick={onLogout}
                style={{
                    position: "absolute", top: "1rem", right: "1rem", color: "white",
                    backgroundColor: "#ba324f", border: "none", padding: "0.5rem 1rem",
                    borderRadius: "5px", cursor: "pointer",
                }}
            >
                Logout <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
        </div>
    );
}

export default WelcomeCard;