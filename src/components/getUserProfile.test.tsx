import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from './getUserProfile';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useNavigate
const mockedUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockUser = {
  id: '1',
  provider: 'local',
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  avatar: 'avatar.jpg',
  role: 'user',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-02T00:00:00Z',
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  it('renders loading state initially', () => {
    localStorageMock.getItem.mockReturnValue('mockToken');
    mockedAxios.get.mockReturnValue(new Promise(() => {})); // Never resolves

    renderWithRouter(<UserProfile />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login if no token is present', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderWithRouter(<UserProfile />);

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('fetches and displays user profile', async () => {
    localStorageMock.getItem.mockReturnValue('mockToken');
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    renderWithRouter(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Username: testuser')).toBeInTheDocument();
      expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Name: Test User')).toBeInTheDocument();
      expect(screen.getByText('Avatar: avatar.jpg')).toBeInTheDocument();
      expect(screen.getByText('Role: user')).toBeInTheDocument();
      expect(
        screen.getByText('Created At: 2023-01-01T00:00:00Z')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Updated At: 2023-01-02T00:00:00Z')
      ).toBeInTheDocument();
    });

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/profile', {
      headers: {
        Authorization: 'Bearer mockToken',
      },
    });
  });

  it('displays error message on fetch failure', async () => {
    localStorageMock.getItem.mockReturnValue('mockToken');
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<UserProfile />);

    await waitFor(() => {
      expect(
        screen.getByText('Error: Failed to fetch user profile')
      ).toBeInTheDocument();
    });
  });

  it('returns null when user is not set', async () => {
    localStorageMock.getItem.mockReturnValue('mockToken');
    mockedAxios.get.mockResolvedValueOnce({ data: null });

    const { container } = renderWithRouter(<UserProfile />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
