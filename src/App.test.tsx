import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import App from './App';

// Mock the dependencies
jest.mock('axios');
jest.mock('socket.io-client');

type MockLocalStorage = {
  getItem: jest.MockedFunction<(key: string) => string | null>;
  setItem: jest.MockedFunction<(key: string, value: string) => void>;
  removeItem: jest.MockedFunction<(key: string) => void>;
};
// Mock the environment variables
process.env.REACT_APP_DEV_ENDPOINT = 'http://localhost:3000';

describe('App Component', () => {
  let mockLocalStorage: MockLocalStorage;
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    // Mock socket.io
    (socketIOClient as jest.Mock).mockReturnValue({
      on: jest.fn(),
      disconnect: jest.fn(),
    });

    // Mock axios
    (axios.create as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: { data: { attributes: { isAdmin: false } } },
      }),
      post: jest.fn().mockResolvedValue({ data: [] }),
    });
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('Drudge')).toBeInTheDocument();
    expect(screen.getByText('Reader')).toBeInTheDocument();
  });

  it('displays login and signup links when not authenticated', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    expect(screen.getByText('SIGNUP')).toBeInTheDocument();
  });

  it('displays profile and logout links when authenticated', () => {
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const logoutLink = screen.getByText('Logout');
    fireEvent.click(logoutLink);

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  it('renders documents received from socket', async () => {
    const mockDocuments = [
      {
        title: 'Test Document',
        link: '<a href="http://example.com">Test</a>',
        pageLocation: 'Headline',
      },
    ];

    let socketHandler: (docs: any) => void;
    (socketIOClient as jest.Mock).mockReturnValue({
      on: jest.fn((event, handler) => {
        if (event === 'initialDocuments') {
          socketHandler = handler;
        }
      }),
      disconnect: jest.fn(),
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    act(() => {
      socketHandler(mockDocuments);
    });

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('handles socket connection errors', async () => {
    (socketIOClient as jest.Mock).mockReturnValue({
      on: jest.fn((event, handler) => {
        if (event === 'connect_error') {
          handler(new Error('Connection failed'));
        }
      }),
      disconnect: jest.fn(),
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Error: Failed to connect to the server')
      ).toBeInTheDocument();
    });
  });

  it('fetches modified links when documents are available', async () => {
    const mockDocuments = [
      {
        title: 'Test Document',
        link: '<a href="http://example.com">Test</a>',
        pageLocation: 'Headline',
      },
    ];

    let socketHandler: (docs: any) => void;
    (socketIOClient as jest.Mock).mockReturnValue({
      on: jest.fn((event, handler) => {
        if (event === 'initialDocuments') {
          socketHandler = handler;
        }
      }),
      disconnect: jest.fn(),
    });

    const mockAxiosPost = jest.fn().mockResolvedValue({
      data: [
        {
          linkId: '123',
          newLink: '<a>New Link</a>',
          modifiedLink: '<a>Modified Link</a>',
        },
      ],
    });
    (axios.create as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: { data: { attributes: { isAdmin: false } } },
      }),
      post: mockAxiosPost,
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    act(() => {
      socketHandler(mockDocuments);
    });

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith('/api/modified-links', {
        sortedDocuments: mockDocuments,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Modified Link')).toBeInTheDocument();
      expect(screen.getByText('New Link')).toBeInTheDocument();
    });
  });
});
