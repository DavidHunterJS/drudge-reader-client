import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import UpdateUserProfile from './updateUserProfile';

jest.mock('axios');

describe('UpdateUserProfile', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mockToken');
  });

  afterEach(() => {
    localStorage.removeItem('token');
    jest.resetAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <Router>
        <UpdateUserProfile />
      </Router>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state if fetching user profile fails', async () => {
    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockRejectedValueOnce(
      new Error('Failed to fetch user profile')
    );

    render(
      <Router>
        <UpdateUserProfile />
      </Router>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Error: Failed to fetch user profile')
      ).toBeInTheDocument();
    });

    axiosGetSpy.mockRestore();
  });

  it('renders user profile form when user data is loaded', async () => {
    const mockUser = {
      _id: '1',
      username: 'johnDoe',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user',
    };

    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockResolvedValueOnce({ data: mockUser });

    render(
      <Router>
        <UpdateUserProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Name:')).toHaveValue(mockUser.name);
      expect(screen.getByLabelText('Username:')).toHaveValue(mockUser.username);
      expect(screen.getByLabelText('Email:')).toHaveValue(mockUser.email);
    });

    axiosGetSpy.mockRestore();
  });

  it('updates user profile when form is submitted', async () => {
    const mockUser = {
      _id: '1',
      username: 'johnDoe',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user',
    };

    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockResolvedValueOnce({ data: mockUser });

    const axiosPutSpy = jest.spyOn(axios, 'put');
    axiosPutSpy.mockResolvedValueOnce({});

    render(
      <Router>
        <UpdateUserProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Name:'), {
      target: { value: 'Updated Name' },
    });
    fireEvent.change(screen.getByLabelText('Username:'), {
      target: { value: 'updatedUsername' },
    });
    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'updated@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Update Profile' }));

    await waitFor(() => {
      expect(axiosPutSpy).toHaveBeenCalledWith(
        '/api/profile',
        {
          name: 'Updated Name',
          userName: 'updatedUsername',
          email: 'updated@example.com',
        },
        {
          headers: {
            Authorization: 'Bearer mockToken',
          },
        }
      );
    });

    axiosGetSpy.mockRestore();
    axiosPutSpy.mockRestore();
  });

  it('redirects to login page if token is not found', async () => {
    localStorage.removeItem('token');

    render(
      <Router>
        <UpdateUserProfile />
      </Router>
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });
});
