// ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be less than 32 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .max(32, 'Password must be less than 32 characters')
    .required('Confirm Password is required'),
});

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get('token');
    setToken(resetToken || '');

    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `/api/verify-token?token=${resetToken}`
        );
        setTokenVerified(response.data.valid);
      } catch (error) {
        console.error('Failed to verify token:', error);
        setTokenError('Invalid or expired token');
      }
    };

    if (resetToken) {
      verifyToken();
    }
  }, [location]);

  useEffect(() => {
    if (tokenError) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [tokenError, navigate]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Perform form validation using Yup
      await validationSchema.validate(
        { newPassword, confirmPassword },
        { abortEarly: false }
      );

      // Send a POST request to the backend API endpoint
      const response = await axios.post('/api/reset-password', {
        token,
        password: newPassword,
      });

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError('Failed to reset password');
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setError(error.errors[0]);
      } else {
        console.error('Error resetting password:', error);
        setError('An error occurred');
      }
    }
  };

  if (tokenError) {
    return (
      <div>
        <p>{tokenError}</p>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  if (!tokenVerified) {
    return <div>Verifying token...</div>;
  }

  if (success) {
    return (
      <div>
        <p>Password has been successfully reset!</p>
        <p>You will be redirected to the login page shortly.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Reset Password</h2>
      {error && <p>{error}</p>}
      {tokenVerified && !success && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
