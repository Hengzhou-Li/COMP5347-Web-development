import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function VerifyEmail() {
    const [message, setMessage] = useState('Verifying your email...');
    const navigate = useNavigate();

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token');

        if (!token) {
            setMessage('Invalid verification link.');
            return;
        }

        axios
            .get(`http://localhost:5000/api/auth/verify-email?token=${token}`)
            .then((res) => {
                setMessage(res.data.msg);
                // 验证成功后自动跳转
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            })
            .catch((err) => {
                setMessage(
                    err.response?.data?.msg || 'Verification failed. The link may be invalid or expired.'
                );
            });
    }, [navigate]);

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Email Verification</h2>
            <p>{message}</p>
        </div>
    );
}

export default VerifyEmail;