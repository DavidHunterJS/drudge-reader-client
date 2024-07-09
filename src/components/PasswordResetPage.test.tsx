import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import PasswordResetPage from './PasswordResetPage';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    search: '?token=testtoken123',
  }),
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PasswordResetPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    renderWithRouter(<PasswordResetPage />);

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reset Password' })
    ).toBeInTheDocument();
  });

  it('updates password inputs when typed', () => {
    renderWithRouter(<PasswordResetPage />);

    const newPasswordInput = screen.getByLabelText(
      'New Password:'
    ) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(
      'Confirm Password:'
    ) as HTMLInputElement;

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });

    expect(newPasswordInput.value).toBe('newpassword123');
    expect(confirmPasswordInput.value).toBe('newpassword123');
  });

  it('shows error when passwords do not match', async () => {
    renderWithRouter(<PasswordResetPage />);

    const newPasswordInput = screen.getByLabelText('New Password:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password321' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('submits the form and shows success message', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    renderWithRouter(<PasswordResetPage />);

    const newPasswordInput = screen.getByLabelText('New Password:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Password reset successfully!')
      ).toBeInTheDocument();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/reset-password', {
      token: 'testtoken123',
      password: 'newpassword123',
    });
  });

  it('shows error message when submission fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<PasswordResetPage />);

    const newPasswordInput = screen.getByLabelText('New Password:');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password:');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to reset password')).toBeInTheDocument();
    });
  });

  it('extracts token from URL', () => {
    renderWithRouter(<PasswordResetPage />);

    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    fireEvent.click(submitButton);

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/reset-password', {
      token: 'testtoken123',
      password: '',
    });
  });
});
