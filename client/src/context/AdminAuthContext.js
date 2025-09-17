import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        if (adminToken && !admin) {
            try {
                const decoded = jwtDecode(adminToken);
                if (decoded.exp * 1000 < Date.now()) {
                    console.log("Admin token expired");
                    adminLogout();
                } else {
                    setAdmin({ role: 'admin' });
                }
            } catch (err) {
                console.error('Invalid admin token:', err);
                adminLogout();
            }
        }
    }, [adminToken, admin]);

    const adminLogin = (token) => {
        localStorage.setItem('adminToken', token);
        setAdminToken(token);
        setAdmin({ role: 'admin' });
    };

    const adminLogout = () => {
        localStorage.removeItem('adminToken');
        setAdminToken(null);
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ adminToken, admin, adminLogin, adminLogout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};