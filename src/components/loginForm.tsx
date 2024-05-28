//  loginForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';
const axiosInstance = axios.create({
  baseURL: ENDPOINT,
});

interface LoginErrorResponse {
  error: string; // Adapt this based on your server's error response structure
}
interface LoginFormProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}
const LoginForm: React.FC<LoginFormProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/api/login', {
        username,
        password,
      });
      const token = response.data.token;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      // Redirect to an authenticated page or update the UI accordingly
    } catch (error: any) {
      console.error('Login failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        const serverError = error.response.data as LoginErrorResponse;
        if (serverError && serverError.error) {
          setError(serverError.error);
        } else {
          setError('An unexpected server error occurred');
        }
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <Link to="/password-request">Forgot Password</Link>
    </div>
  );
};

export default LoginForm;
