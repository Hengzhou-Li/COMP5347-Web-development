import { useState } from 'react';
import axios from 'axios';

function PasswordResetRequest() {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMsg(res.data.msg || 'Email sent successfully.');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send reset email.');
        }
    };


    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send Reset Link</button>
            </form>

            {msg && <p style={{ color: 'green' }}>{msg}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default PasswordResetRequest;