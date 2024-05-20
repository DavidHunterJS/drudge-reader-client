import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/',
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
    <div>
      <h2>User Profile</h2>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Name: {user.name}</p>
      <p>Avatar: {user.avatar}</p>
      <p>Role: {user.role}</p>
      <p>Created At: {user.createdAt}</p>
      <p>Updated At: {user.updatedAt}</p>
      {/* Display other user properties as needed */}
    </div>
  );
};

export default UserProfile;
