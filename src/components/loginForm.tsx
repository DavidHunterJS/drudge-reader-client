// loginForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface LoginFormProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

interface DecodedToken {
  role: string;
  // Add other token properties as needed
}

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

const LoginForm: React.FC<LoginFormProps> = ({
  setIsAuthenticated,
  setIsAdmin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/api/login', {
        username,
        password,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);

      const decodedToken: DecodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === 'ADMIN');

      setSuccess('Login successful!');
      setError('');
      // Wait for 3 seconds before navigating to the root directory
      setTimeout(() => {
        navigate('/');
      }, 2000);
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
      setSuccess('');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center">Login</h2>
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <fieldset>
                  <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    Login
                  </button>
                </fieldset>
              </form>
              <div className="text-center mt-3">
                <Link to="/password-request">Forgot Password?</Link>
              </div>
              <div className="text-center mt-3">
                <Link to="/register"> Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
