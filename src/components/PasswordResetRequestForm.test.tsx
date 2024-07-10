import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios, { AxiosResponse } from 'axios';
import PasswordResetRequestForm from './PasswordResetRequestForm';

jest.mock('axios');

describe('PasswordResetRequestForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the password reset request form', () => {
    render(<PasswordResetRequestForm />);
    expect(screen.getByText('Password Reset Request')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Request Password Reset' })
    ).toBeInTheDocument();
  });

  it('updates the email input value', () => {
    render(<PasswordResetRequestForm />);
    const emailInput = screen.getByLabelText('Email:');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('submits the form and displays success message', async () => {
    const mockResponse: AxiosResponse = {
      data: { message: 'Password reset email sent' },
    } as AxiosResponse;
    (
      axios.post as jest.MockedFunction<typeof axios.post>
    ).mockResolvedValueOnce(mockResponse);

    render(<PasswordResetRequestForm />);
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', {
      name: 'Request Password Reset',
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/password-request', {
        email: 'test@example.com',
      });
      expect(screen.getByText('Password reset email sent')).toBeInTheDocument();
    });
  });

  it('displays error message when form submission fails', async () => {
    (
      axios.post as jest.MockedFunction<typeof axios.post>
    ).mockRejectedValueOnce(new Error('Request failed'));

    render(<PasswordResetRequestForm />);
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', {
      name: 'Request Password Reset',
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/password-request', {
        email: 'test@example.com',
      });
      expect(
        screen.getByText('An error occurred. Please try again.')
      ).toBeInTheDocument();
    });
  });

  it('clears the email input and message after successful submission', async () => {
    const mockResponse: AxiosResponse = {
      data: { message: 'Password reset email sent' },
    } as AxiosResponse;
    (
      axios.post as jest.MockedFunction<typeof axios.post>
    ).mockResolvedValueOnce(mockResponse);

    render(<PasswordResetRequestForm />);
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', {
      name: 'Request Password Reset',
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toHaveValue('');
      expect(
        screen.queryByText('Password reset email sent')
      ).not.toBeInTheDocument();
    });
  });
});
