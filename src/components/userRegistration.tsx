import React, { useState } from 'react';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/',
});

interface RegistrationFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

const UserRegistration: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/api/register', formData);
      console.log('Registration successful:', response.data);
      // Handle successful registration, e.g., show a success message or redirect to login page
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle registration error, e.g., display an error message to the user
    }
  };

  return (
    <div>
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default UserRegistration;
