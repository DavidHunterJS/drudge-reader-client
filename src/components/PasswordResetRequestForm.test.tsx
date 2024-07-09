import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import PasswordResetRequestForm from './PasswordResetRequestForm';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PasswordResetRequestForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<PasswordResetRequestForm />);

    expect(screen.getByText('Password Reset Request')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Request Password Reset' })
    ).toBeInTheDocument();
  });

  it('updates email input value when typed', () => {
    render(<PasswordResetRequestForm />);

    const emailInput = screen.getByLabelText('Email:') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('submits the form and shows success message', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: 'Reset link sent to your email.' },
    });

    render(<PasswordResetRequestForm />);

    const emailInput = screen.getByLabelText('Email:');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', {
      name: 'Request Password Reset',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Reset link sent to your email.')
      ).toBeInTheDocument();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/password-request', {
      email: 'test@example.com',
    });
  });

  it('shows error message when submission fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    render(<PasswordResetRequestForm />);

    const emailInput = screen.getByLabelText('Email:');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', {
      name: 'Request Password Reset',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred. Please try again.')
      ).toBeInTheDocument();
    });
  });

  it('clears the email input after successful submission', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: 'Reset link sent to your email.' },
    });

    render(<PasswordResetRequestForm />);

    const emailInput = screen.getByLabelText('Email:') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', {
      name: 'Request Password Reset',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput.value).toBe('');
    });
  });

  it('does not clear the email input after failed submission', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    render(<PasswordResetRequestForm />);

    const emailInput = screen.getByLabelText('Email:') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', {
      name: 'Request Password Reset',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred. Please try again.')
      ).toBeInTheDocument();
    });

    expect(emailInput.value).toBe('test@example.com');
  });
});
