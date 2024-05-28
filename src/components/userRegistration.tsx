import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';
const axiosInstance = axios.create({ baseURL: ENDPOINT });

// Validation Schema using Yup
const RegistrationSchema = Yup.object().shape({
  firstname: Yup.string()
    .min(2, 'First Name is too short!')
    .max(16, 'First Name is too long')
    .required('First Name is required'),
  lastname: Yup.string()
    .min(2, 'Last Name is too short!')
    .max(16, 'Last Name is too long')
    .required('Last Name is required'),
  username: Yup.string()
    .min(2, 'Userame is too short!')
    .max(16, 'Username is too long')
    .required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(32, 'Password is too long')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  role: Yup.string().required('Role is required'),
});

const UserRegistration = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div>
      <h2>User Registration</h2>
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <Formik
        initialValues={{
          firstname: '',
          lastname: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'USER',
        }}
        validationSchema={RegistrationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            const response = await axiosInstance.post('/api/register', values);
            console.log('Registration successful:', response.data);
            setSuccessMessage('Registration successful!');
            setErrorMessage('');
            resetForm({
              values: { ...values, password: '', confirmPassword: '' },
            });
            setSubmitting(false);
          } catch (error) {
            console.error('Registration failed:', error);
            setSuccessMessage('');
            setErrorMessage('Registration failed. Please try again.');
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <label htmlFor="firstname">First Name</label>
              <Field
                name="firstname"
                type="text"
                id="firstname"
                aria-describedby="firstnameError"
              />
              <ErrorMessage
                name="firstname"
                component="div"
                className="error"
                id="firstnameError"
              />
            </div>

            <div>
              <label htmlFor="lastname">Last Name</label>
              <Field
                name="lastname"
                type="text"
                id="lastname"
                aria-describedby="lastnameError"
              />
              <ErrorMessage
                name="lastname"
                component="div"
                className="error"
                id="lastnameError"
              />
            </div>

            <div>
              <label htmlFor="username">Username</label>
              <Field
                name="username"
                type="text"
                id="username"
                aria-describedby="usernameError"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="error"
                id="usernameError"
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <Field
                name="email"
                type="email"
                id="email"
                aria-describedby="emailError"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="error"
                id="emailError"
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <Field
                name="password"
                type="password"
                id="password"
                aria-describedby="passwordError"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="error"
                id="passwordError"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <Field
                name="confirmPassword"
                type="password"
                id="confirmPassword"
                aria-describedby="confirmPasswordError"
              />
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="error"
                id="confirmPasswordError"
              />
            </div>

            <div>
              <label htmlFor="role">Role</label>
              <Field
                as="select"
                name="role"
                id="role"
                aria-describedby="roleError"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </Field>
              <ErrorMessage
                name="role"
                component="div"
                className="error"
                id="roleError"
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              Register
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UserRegistration;
