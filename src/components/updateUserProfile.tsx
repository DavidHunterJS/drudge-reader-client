import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';

const axiosInstance = axios.create({
  baseURL: ENDPOINT,
  withCredentials: true,
});

interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

const UpdateUserProfile: React.FC = () => {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching user profile...');
        const response = await axiosInstance.get<User>('/api/profile');
        console.log('Profile response:', response.data);
        setUser(response.data);
        setName(response.data.name);
        setEmail(response.data.email);
        setUserName(response.data.username);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
          console.error('Response status:', error.response?.status);
        }
        setError('Failed to fetch user profile. Please try again.');
      }
    };
    if (!isLoading) {
      fetchUserProfile();
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setUpdateSuccess(false);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      console.log('Updating user profile...');
      const response = await axiosInstance.put<User>('/api/profile', {
        name,
        username: userName,
        email,
      });
      console.log('Update response:', response.data);
      setUpdateSuccess(true);
      setUser(response.data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('Failed to update user profile. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="container mt-5">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <p>Please log in to view this page.</p>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">Update User Profile</h2>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {updateSuccess && (
                <div className="alert alert-success">
                  Profile updated successfully!
                </div>
              )}
              {user ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Name:
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userName" className="form-label">
                      Username:
                    </label>
                    <input
                      type="text"
                      id="userName"
                      className="form-control"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email:
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Update Profile
                  </button>
                </form>
              ) : (
                <p>Unable to load user profile. Please try again later.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserProfile;
