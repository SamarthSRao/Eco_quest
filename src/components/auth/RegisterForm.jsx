import React, { useState } from 'react';

import { register } from '../../api/authService';

function RegisterForm({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate password match
        if (password !== confirmPassword) {
            setStatus('Passwords do not match');
            return;
        }

        setStatus('Creating account...');
        setLoading(true);

        try {
            const data = await register(name, email, password);
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setStatus('Registration successful!');
            if (typeof onSuccess === 'function') {
                onSuccess(data);
            }
        } catch (error) {
            setStatus(`Registration Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="text-lg font-semibold">Register</h2>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
                className="w-full p-2 rounded bg-gray-800 text-white"
            />
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
                minLength="6"
                className="w-full p-2 rounded bg-gray-800 text-white"
            />
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                minLength="6"
                className="w-full p-2 rounded bg-gray-800 text-white"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded" disabled={loading}>
                {loading ? 'Please wait...' : 'Register'}
            </button>
            {status && <p className="text-sm text-gray-300">{status}</p>}
        </form>
    );
}

export default RegisterForm;
