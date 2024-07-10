import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import ResetPassword from './ResetPassword';

jest.mock('axios');

describe('ResetPassword', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the reset password form when token is verified', async () => {
    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockResolvedValueOnce({ data: { valid: true } });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Reset Password' })
      ).toBeInTheDocument();
    });

    axiosGetSpy.mockRestore();
  });

  it('displays an error message when token verification fails', async () => {
    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockRejectedValueOnce(new Error('Invalid token'));

    render(
      <MemoryRouter initialEntries={['/reset-password?token=invalid-token']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
    });

    axiosGetSpy.mockRestore();
  });

  it('resets the password successfully when form is submitted with valid data', async () => {
    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockResolvedValueOnce({ data: { valid: true } });

    const axiosPostSpy = jest.spyOn(axios, 'post');
    axiosPostSpy.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'newPassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password:'), {
      target: { value: 'newPassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(axiosPostSpy).toHaveBeenCalledWith('/api/reset-password', {
        token: 'valid-token',
        password: 'newPassword123',
      });
      expect(
        screen.getByText('Password has been successfully reset!')
      ).toBeInTheDocument();
    });

    axiosGetSpy.mockRestore();
    axiosPostSpy.mockRestore();
  });

  it('displays an error message when form is submitted with invalid data', async () => {
    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockResolvedValueOnce({ data: { valid: true } });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
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

    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 8 characters')
      ).toBeInTheDocument();
    });

    axiosGetSpy.mockRestore();
  });

  it('redirects to login page after successful password reset', async () => {
    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockResolvedValueOnce({ data: { valid: true } });

    const axiosPostSpy = jest.spyOn(axios, 'post');
    axiosPostSpy.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'newPassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password:'), {
      target: { value: 'newPassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    axiosGetSpy.mockRestore();
    axiosPostSpy.mockRestore();
  });
});
