import { useState } from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

function Login() {

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const fromPath = location.state?.from || '/Home';

    const { login } = useContext(AuthContext); //全局login

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            setMessage(res.data.msg);
            setError('');

            login(res.data.token, res.data.user);

            setTimeout(() => {
                navigate(fromPath, { replace: true }); //跳转回之前的页面
            }, 500); // 延迟0.5秒

        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed.');
            setMessage('');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <button type="submit">Login</button>
                <Link to="/password-reset-request">Forgot your password?</Link>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default Login;