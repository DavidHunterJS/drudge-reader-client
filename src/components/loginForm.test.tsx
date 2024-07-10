// loginForm.test.tsx
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import LoginForm from './loginForm';

jest.mock('axios');

describe('LoginForm', () => {
  const mockSetIsAuthenticated = jest.fn();
  const mockSetIsAdmin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    render(
      <MemoryRouter>
        <LoginForm
          setIsAuthenticated={mockSetIsAuthenticated}
          setIsAdmin={mockSetIsAdmin}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('updates the username and password state when input values change', () => {
    render(
      <MemoryRouter>
        <LoginForm
          setIsAuthenticated={mockSetIsAuthenticated}
          setIsAdmin={mockSetIsAdmin}
        />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Username:');
    const passwordInput = screen.getByLabelText('Password:');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpassword');
  });

  it('submits the login form and handles successful login', async () => {
    const mockToken = 'mockToken';
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { token: mockToken },
    });
    jest.spyOn(window.localStorage.__proto__, 'setItem');

    render(
      <MemoryRouter>
        <LoginForm
          setIsAuthenticated={mockSetIsAuthenticated}
          setIsAdmin={mockSetIsAdmin}
        />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Username:');
    const passwordInput = screen.getByLabelText('Password:');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://trippy.wtf/forum/api/token',
        {
          identification: 'testuser',
          password: 'testpassword',
        }
      );
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
      expect(screen.getByText('Login successful!')).toBeInTheDocument();
    });
  });

  it('handles login error when server returns an error', async () => {
    const mockError = { response: { data: { error: 'Invalid credentials' } } };
    (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

    render(
      <MemoryRouter>
        <LoginForm
          setIsAuthenticated={mockSetIsAuthenticated}
          setIsAdmin={mockSetIsAdmin}
        />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  // Add more test cases as needed
});
