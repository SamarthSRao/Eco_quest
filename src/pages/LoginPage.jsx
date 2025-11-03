import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI, setAuthToken, setStoredUser } from "../services/api";
import api from '../services/api';

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // If Strava OAuth redirected back with a JWT token, use it to sign in
    const stravaToken = searchParams.get('strava_token');
    if (stravaToken) {
      setAuthToken(stravaToken);
      navigate('/dashboard', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await authAPI.login(email, password);
      // Expecting { token, user }
      if (data?.token) {
        setAuthToken(data.token);
        if (data.user) setStoredUser(data.user);
        // Navigate to dashboard using React Router
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div>
        <form
          onSubmit={handleLogin}
          className="bg-gray-800 p-8 rounded shadow-md flex flex-col gap-4 w-80"
        >
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{error}</div>
          )}
          <input
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400 mb-2">or</p>
          <button
            onClick={async () => {
              try {
                const res = await api.get('/api/strava/auth-url');
                const { authUrl } = res.data;
                window.location.href = authUrl;
              } catch (err) {
                setError('Failed to start Strava sign-in');
              }
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded p-2 w-80"
          >
            Sign in with Strava
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;