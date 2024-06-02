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
  _id: string;
  username: string;
  email: string;
  name: string;
  // Add other properties as needed
}

const UpdateUserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
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
        setName(response.data.name);
        setEmail(response.data.email);
        setUserName(response.data.username);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to fetch user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axiosInstance.put(
        '/api/profile',
        { name, userName, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optionally, you can fetch the updated user profile again
      // or update the user state with the new values
      // setUser({ ...user, name, email });

      // Redirect to the profile page or show a success message
      navigate('/profile');
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('Failed to update user profile');
    }
  };

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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">Update User Profile</h2>
            </div>
            <div className="card-body">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserProfile;
