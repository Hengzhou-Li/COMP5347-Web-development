import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';

import { jwtDecode } from 'jwt-decode';
import {AuthContext} from "../context/AuthContext";

function AdminRoute() {
    const { token } = useContext(AuthContext);

    if (!token) return <Navigate to="/login" replace />;


    return <Outlet />;
}

export default AdminRoute;