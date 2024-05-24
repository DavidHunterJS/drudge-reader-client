import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';
const axiosInstance = axios.create({
  baseURL: ENDPOINT,
});

interface RegistrationFormData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface ErrorResponse {
  error: string;
}

const UserRegistration: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });
  const [formErrors, setFormErrors] = useState<Partial<RegistrationFormData>>(
    {}
  );
  const [serverMessage, setServerMessage] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<RegistrationFormData> = {};
    if (formData.username.trim() === '') {
      errors.username = 'Username is required';
    }
    if (formData.firstname.trim() === '') {
      errors.firstname = 'First Name is required';
    }
    if (formData.lastname.trim() === '') {
      errors.lastname = 'Last Name is required';
    }
    if (formData.email.trim() === '') {
      errors.email = 'Email is required';
    }
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerMessage('');
    if (!validateForm()) {
      return;
    }

    try {
      console.log(formData.role);
      const response = await axiosInstance.post('/api/register', formData);
      console.log('Registration successful:', response.data);
      setServerMessage('Registration successful!');
      // Reset form data
      setFormData({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
      });
      // Reset form errors
      setFormErrors({});
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        const serverError = error.response.data as ErrorResponse;
        if (serverError && serverError.error) {
          setServerMessage(serverError.error);
        } else {
          setServerMessage('An unexpected server error occurred');
        }
      } else {
        setServerMessage('An unknown error occurred');
      }
    }
  };

  return (
    <div>
      <h2>User Registration</h2>
      {serverMessage && <div>{serverMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstname">First Name:</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
            required
          />
          {formErrors.firstname && <span>{formErrors.firstname}</span>}
        </div>
        <div>
          <label htmlFor="lastname">Last Name:</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleInputChange}
            required
          />
          {formErrors.lastname && <span>{formErrors.lastname}</span>}
        </div>
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
          {formErrors.username && <span>{formErrors.username}</span>}
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
          {formErrors.email && <span>{formErrors.email}</span>}
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
          {formErrors.password && <span>{formErrors.password}</span>}
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
          {formErrors.confirmPassword && (
            <span>{formErrors.confirmPassword}</span>
          )}
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default UserRegistration;
