
import './App.css';

import { AuthProvider } from './context/AuthContext'; //全局访问登录
import {BrowserRouter, Routes, Route, useLocation, Navigate} from 'react-router-dom';
import Signup from './pages/Auth/Signup';
import Login from './pages/Auth/Login';
import VerifyEmail from './pages/Auth/VerifyEmail';
import PasswordResetRequest from './pages/Auth/PasswordResetRequest';
import Navbar from './components/Navbar';
import Home from "./pages/Home";
import ResetPassword from "./pages/Auth/ResetPassword"
import Profile from './pages/Profile';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminNavbar from "./components/AdminNavbar";
import UserManagement from "./pages/Admin/UserManagement";
import ListingManagement from "./pages/Admin/ListingManagement";
import ReviewManagement from "./pages/Admin/ReviewManagement";
import OrderManagement from "./pages/Admin/OrderManagement";
import AdminLogs from "./pages/Admin/AdminLogs";
import {AdminAuthProvider} from "./context/AdminAuthContext";
import AdminRoute from './routes/AdminRoute';
import Main_page from "./pages/Main_page";
import Cart from "./pages/Auth/Cart";
import SearchPage from "./pages/Auth/SearchPage";
import PhoneDetail from "./components/PhoneDetail";
import Order from "./pages/Auth/Order";
import Wishlist from "./pages/Auth/Wishlist";
import UserRoute from "./routes/UserRoute";
import RequireAuth from "./utils/requireAuth";



function LayoutWrapper() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <>
            {isAdmin ? <AdminNavbar /> : <Navbar />}

            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/main_page" element={<Main_page />} />
                <Route path="/home" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/password-reset-request" element={<PasswordResetRequest />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
                <Route path="/order" element={<RequireAuth><Order /></RequireAuth>} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
                <Route path="/phone/:id" element={<PhoneDetail />} />
                {/* 可继续添加更多 正常子路由 */}
                {/* 所有 admin 路由都以 /admin 开头 */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute />}>
                    <Route path="users" element={<UserManagement />} />
                    <Route path="listings" element={<ListingManagement />} />
                    <Route path="reviews" element={<ReviewManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="logs" element={<AdminLogs />} />
                </Route>
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <AdminAuthProvider>
                <BrowserRouter>
                    <LayoutWrapper/>
                </BrowserRouter>
            </AdminAuthProvider>
        </AuthProvider>
    );
}
export default App;

// test
