import {AdminAuthContext} from "../context/AdminAuthContext";
import {useContext} from "react";
import { Link, useNavigate } from "react-router-dom";


function AdminNavbar() {
    const { admin, adminLogout } = useContext(AdminAuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        adminLogout();
        navigate("/admin/login");
    };

    return (
        <nav style={{
            backgroundColor: "#222",
            color: "#fff",
            padding: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>

            <div style={{ display: "flex", gap: "1rem" }}>
                <Link to="/admin/users" style={linkStyle}>Users</Link>
                <Link to="/admin/listings" style={linkStyle}>Listings</Link>
                <Link to="/admin/reviews" style={linkStyle}>Reviews</Link>
                <Link to="/admin/orders" style={linkStyle}>Orders</Link>
                <Link to="/admin/logs" style={linkStyle}>Logs</Link>
            </div>

            {admin && (
                <button onClick={handleLogout} style={logoutButtonStyle}>
                    Logout
                </button>
            )}
        </nav>
    );
}

const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold"
};

const logoutButtonStyle = {
    backgroundColor: "#555",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    cursor: "pointer"
};

export default AdminNavbar;