import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
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

interface FormValues {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

const UserRegistration = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setFieldError }: FormikHelpers<FormValues>
  ) => {
    try {
      console.log('handleSubmit Fired!!~~~');
      // Send a POST request to the backend API to create the user
      const response = await axiosInstance.post('/api/signup', values);

      // Clear form fields
      setSuccessMessage('User registered successfully');
      setErrorMessage('');
    } catch (error) {
      console.error('Error registering user:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const errorData = error.response.data;
          if (
            typeof errorData === 'object' &&
            errorData !== null &&
            (errorData as { error?: string }).error ===
              'Username or email already exists'
          ) {
            setFieldError('username', 'Username already exists');
            setFieldError('email', 'Email already exists');
          } else {
            setErrorMessage('An error occurred while registering user');
          }
        } else {
          // Something happened in setting up the request that triggered an Error
          setErrorMessage('An error occurred while sending the request');
        }
      } else {
        // Something happened in setting up the request that triggered an Error
        setErrorMessage('An unexpected error occurred');
      }

      setSuccessMessage('');
    }

    // Set submitting to false to re-enable the submit button
    setSubmitting(false);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="row">
        <div className="col-sm-14">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center">User Registration</h2>
              {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
              )}
              {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}
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
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className="form-group">
                      <label htmlFor="firstname">First Name</label>
                      <Field
                        name="firstname"
                        type="text"
                        id="firstname"
                        aria-describedby="firstnameError"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="firstname"
                        component="div"
                        className="invalid-feedback"
                        id="firstnameError"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastname">Last Name</label>
                      <Field
                        name="lastname"
                        type="text"
                        id="lastname"
                        aria-describedby="lastnameError"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="lastname"
                        component="div"
                        className="invalid-feedback"
                        id="lastnameError"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <Field
                        name="username"
                        type="text"
                        id="username"
                        aria-describedby="usernameError"
                        className={`form-control ${
                          errors.username && touched.username
                            ? 'is-invalid'
                            : ''
                        }`}
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="invalid-feedback"
                        id="usernameError"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <Field
                        name="email"
                        type="email"
                        id="email"
                        aria-describedby="emailError"
                        className={`form-control ${
                          errors.email && touched.email ? 'is-invalid' : ''
                        }`}
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="invalid-feedback"
                        id="emailError"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <Field
                        name="password"
                        type="password"
                        id="password"
                        aria-describedby="passwordError"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="invalid-feedback"
                        id="passwordError"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <Field
                        name="confirmPassword"
                        type="password"
                        id="confirmPassword"
                        aria-describedby="confirmPasswordError"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="invalid-feedback"
                        id="confirmPasswordError"
                      />
                    </div>

                    {/* <div className="form-group">
                      <label htmlFor="role">Role</label>
                      <Field
                        as="select"
                        name="role"
                        id="role"
                        aria-describedby="roleError"
                        className="form-control"
                      >
                        <option value="USER">User</option>
                      </Field>
                      <ErrorMessage
                        name="role"
                        component="div"
                        className="invalid-feedback"
                        id="roleError"
                      />
                    </div> */}

                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={isSubmitting}
                    >
                      Register
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
