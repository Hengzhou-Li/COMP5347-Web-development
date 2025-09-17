import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { jwtDecode } from 'jwt-decode';

function AdminRoute() {
    const { adminToken } = useContext(AdminAuthContext);

    if (!adminToken) return <Navigate to="/admin/login" replace />;

    try {
        const decoded = jwtDecode(adminToken);
        if (decoded.role !== 'admin') {
            return <Navigate to="/admin/login" replace />;
        }
    } catch (err) {
        console.error('Invalid admin token:', err);
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}

export default AdminRoute;