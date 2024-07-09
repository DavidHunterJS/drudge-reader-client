import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import UserRegistration from './userRegistration';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the registration form', () => {
    render(<UserRegistration />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Register' })
    ).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    render(<UserRegistration />);
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('displays validation errors for invalid inputs', async () => {
    render(<UserRegistration />);

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'a' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Username is too short!')).toBeInTheDocument();
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });
  });

  it('submits the form successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    render(<UserRegistration />);

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(
        screen.getByText(/We've sent a confirmation email to test@example.com/)
      ).toBeInTheDocument();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://trippy.wtf/forum/api/users',
      {
        data: {
          attributes: {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
          },
        },
      },
      expect.any(Object)
    );
  });

  it('handles server error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          errors: [{ detail: 'Username already taken' }],
        },
      },
    });

    render(<UserRegistration />);

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(
        screen.getByText('Validation error(s): Username already taken')
      ).toBeInTheDocument();
    });
  });

  it('handles network error', async () => {
    mockedAxios.post.mockRejectedValueOnce({ request: {} });

    render(<UserRegistration />);

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(
        screen.getByText('No response received from the server.')
      ).toBeInTheDocument();
    });
  });
});
