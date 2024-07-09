import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import UpdateUserProfile from './updateUserProfile';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('UpdateUserProfile', () => {
  const mockUser = {
    _id: '1',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <UpdateUserProfile />
      </BrowserRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('fetches and displays user profile', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    render(
      <BrowserRouter>
        <UpdateUserProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Name:')).toHaveValue('Test User');
      expect(screen.getByLabelText('Username:')).toHaveValue('testuser');
      expect(screen.getByLabelText('Email:')).toHaveValue('test@example.com');
    });
  });

  it('handles error when fetching user profile', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <UpdateUserProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Error: Failed to fetch user profile')
      ).toBeInTheDocument();
    });
  });

  it('updates user profile successfully', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });
    mockedAxios.put.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <UpdateUserProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Name:'), {
      target: { value: 'Updated Name' },
    });
    fireEvent.change(screen.getByLabelText('Username:'), {
      target: { value: 'updateduser' },
    });
    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'updated@example.com' },
    });

    fireEvent.click(screen.getByText('Update Profile'));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/profile',
        {
          name: 'Updated Name',
          userName: 'updateduser',
          email: 'updated@example.com',
        },
        expect.any(Object)
      );
    });
  });

  it('handles error when updating user profile', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });
    mockedAxios.put.mockRejectedValueOnce(new Error('Failed to update'));

    render(
      <BrowserRouter>
        <UpdateUserProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Update Profile'));

    await waitFor(() => {
      expect(
        screen.getByText('Error: Failed to update user profile')
      ).toBeInTheDocument();
    });
  });

  it('redirects to login page when token is missing', async () => {
    localStorage.removeItem('token');
    const mockNavigate = jest.fn();
    jest
      .spyOn(require('react-router-dom'), 'useNavigate')
      .mockReturnValue(mockNavigate);

    render(
      <BrowserRouter>
        <UpdateUserProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
