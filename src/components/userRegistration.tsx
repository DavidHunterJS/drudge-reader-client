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
  username: Yup.string()
    .min(2, 'Userame is too short!')
    .max(16, 'Username is too long')
    .required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(32, 'Password is too long')
    .required('Password is required'),
});

interface FormValues {
  username: string;
  email: string;
  password: string;
}

const UserRegistration = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setFieldError, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      console.log('handleSubmit Fired!!~~~');

      // Send a POST request to the backend API to create the user
      const response = await axios.post(
        'https://trippy.wtf/forum/api/users',
        {
          data: {
            attributes: values,
          },
        },
        {
          headers: {
            Authorization:
              'Token ify0FZ00A!JT##Le]5mhR{1y?%!0E3R+G9keQW#7; userId=1',
          },
        }
      );

      // Clear form fields
      resetForm();

      // Set success message
      setSuccessMessage(
        `We've sent a confirmation email to ${values.email}. If it doesn't arrive soon, check your spam folder.`
      );
      setErrorMessage('');
      setTimeout(() => {
        window.location.href = '/';
      }, 15000);
    } catch (error) {
      // ... (error handling code remains the same)
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
                  username: '',
                  email: '',
                  password: '',
                }}
                validationSchema={RegistrationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
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
