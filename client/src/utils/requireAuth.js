import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function RequireAuth({ children }) {
    const { user , loading, token} = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user && !token) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
}