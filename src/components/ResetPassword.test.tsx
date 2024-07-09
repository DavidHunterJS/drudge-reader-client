import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import ResetPassword from './ResetPassword';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

describe('ResetPassword', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocation as jest.Mock).mockReturnValue({
      search: '?token=valid-token',
    });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('renders verifying token message initially', () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    expect(screen.getByText('Verifying token...')).toBeInTheDocument();
  });

  it('displays reset password form when token is verified', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { valid: true } });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument();
    });
  });

  it('handles invalid token', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Invalid token'));

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
      expect(
        screen.getByText('Redirecting to login page...')
      ).toBeInTheDocument();
    });
  });

  it('submits new password successfully', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { valid: true } });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password:'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByText('Reset Password'));

    await waitFor(() => {
      expect(
        screen.getByText('Password has been successfully reset!')
      ).toBeInTheDocument();
    });
  });

  it('handles password reset failure', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { valid: true } });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: false } });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password:'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByText('Reset Password'));

    await waitFor(() => {
      expect(screen.getByText('Failed to reset password')).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { valid: true } });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password:'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByText('Reset Password'));

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 8 characters')
      ).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { valid: true } });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'validpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password:'), {
      target: { value: 'differentpassword123' },
    });
    fireEvent.click(screen.getByText('Reset Password'));

    await waitFor(() => {
      expect(screen.getByText('Passwords must match')).toBeInTheDocument();
    });
  });
});
