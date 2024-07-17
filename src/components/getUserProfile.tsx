import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Adjust the import path as needed

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';

const axiosInstance = axios.create({
  baseURL: ENDPOINT,
  withCredentials: true, // This is important for sending cookies
});

interface User {
  id: string;
  provider: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const UserProfile: React.FC = () => {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching user profile...');
        const response = await axiosInstance.get<User>('/api/profile');
        console.log('Profile response:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
          console.error('Response status:', error.response?.status);
        }
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p>Please log in to view this page.</p>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Unable to load user profile. Please try again later.</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title mb-4">User Profile</h2>
              <div className="mb-3">
                <strong>Username:</strong> {user.username}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="mb-3">
                <strong>First Name:</strong> {user.firstName}
              </div>
              <div className="mb-3">
                <strong>Last Name:</strong> {user.lastName}
              </div>
              <div className="mb-3">
                <strong>Avatar:</strong> {user.avatar}
              </div>
              <div className="mb-3">
                <strong>Role:</strong> {user.role}
              </div>
              <div className="mb-3">
                <strong>Created At:</strong> {user.createdAt}
              </div>
              <div className="mb-3">
                <strong>Updated At:</strong> {user.updatedAt}
              </div>
              {/* Display other user properties as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
