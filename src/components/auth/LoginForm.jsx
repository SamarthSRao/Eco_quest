import React, { useState } from 'react';
import { login } from '../../api/authService';

function LoginForm({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Logging in...');
        setLoading(true);

        try {
            const data = await login(email, password);
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setStatus('Login successful!');
            if (typeof onSuccess === 'function') {
                onSuccess(data);
            }
        } catch (error) {
            setStatus(`Login Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="text-lg font-semibold">Login</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full p-2 rounded bg-gray-800 text-white"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full p-2 rounded bg-gray-800 text-white"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded" disabled={loading}>
                {loading ? 'Please wait...' : 'Log In'}
            </button>
            {status && <p className="text-sm text-gray-300">{status}</p>}
        </form>
    );
}

export default LoginForm;


