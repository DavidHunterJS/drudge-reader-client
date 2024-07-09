import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './loginForm';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useNavigate
const mockedUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginForm', () => {
  const mockSetIsAuthenticated = jest.fn();
  const mockSetIsAdmin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    renderWithRouter(
      <LoginForm
        setIsAuthenticated={mockSetIsAuthenticated}
        setIsAdmin={mockSetIsAdmin}
      />
    );

    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('updates input values when typed', () => {
    renderWithRouter(
      <LoginForm
        setIsAuthenticated={mockSetIsAuthenticated}
        setIsAdmin={mockSetIsAdmin}
      />
    );

    const usernameInput = screen.getByLabelText(
      'Username:'
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      'Password:'
    ) as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('submits the form and handles successful login', async () => {
    const mockToken = 'mockToken123';
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.post.mockResolvedValueOnce({ data: { token: mockToken } });

    renderWithRouter(
      <LoginForm
        setIsAuthenticated={mockSetIsAuthenticated}
        setIsAdmin={mockSetIsAdmin}
      />
    );

    const usernameInput = screen.getByLabelText('Username:');
    const passwordInput = screen.getByLabelText('Password:');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login successful!')).toBeInTheDocument();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://trippy.wtf/forum/api/token',
      {
        identification: 'testuser',
        password: 'password123',
      }
    );
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);

    // Wait for navigation
    await waitFor(
      () => {
        expect(mockedUseNavigate).toHaveBeenCalledWith('/');
      },
      { timeout: 2500 }
    );
  });

  it('handles login failure', async () => {
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderWithRouter(
      <LoginForm
        setIsAuthenticated={mockSetIsAuthenticated}
        setIsAdmin={mockSetIsAdmin}
      />
    );

    const usernameInput = screen.getByLabelText('Username:');
    const passwordInput = screen.getByLabelText('Password:');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
    expect(mockedUseNavigate).not.toHaveBeenCalled();
  });

  it('handles unexpected errors', async () => {
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(
      <LoginForm
        setIsAuthenticated={mockSetIsAuthenticated}
        setIsAdmin={mockSetIsAdmin}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
    });
  });
});
