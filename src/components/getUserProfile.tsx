import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';
const axiosInstance = axios.create({
  baseURL: ENDPOINT,
});

interface User {
  id: string;
  provider: string;
  email: string;
  username: string;
  name: string;
  avatar: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axiosInstance.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to fetch user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return null;
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
                <strong>Name:</strong> {user.name}
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
