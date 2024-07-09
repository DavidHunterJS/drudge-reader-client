import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './adminDashboard';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useNavigate
const mockedUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
}));

// Mock Modal component
jest.mock(
  './Modal',
  () =>
    ({ children, isOpen, onClose }: any) =>
      isOpen ? <div data-testid="modal">{children}</div> : null
);

// Mock UserEditForm component
jest.mock('./userEditForm', () => ({ user, onSave }: any) => (
  <div data-testid="user-edit-form">
    <button onClick={() => onSave(user)}>Save</button>
  </div>
));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockUsers = [
  { id: '1', username: 'user1', email: 'user1@example.com', role: 'user' },
  { id: '2', username: 'user2', email: 'user2@example.com', role: 'admin' },
];

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxios);
    window.confirm = jest.fn(() => true);
  });

  it('renders loading state initially', () => {
    localStorageMock.getItem.mockReturnValue('mockToken');
    renderWithRouter(<AdminDashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login if no token is present', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithRouter(<AdminDashboard />);
    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('fetches and displays user list', async () => {
    localStorageMock.getItem.mockReturnValue(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.8tat9ElZ6Rhy_XyA6O5CfDNab6hSjRWl-6OhMQFWrTc'
    );
    mockedAxios.get.mockResolvedValueOnce({ data: mockUsers });

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, admin!')).toBeInTheDocument();
      expect(
        screen.getByText('user1 - user1@example.com - user')
      ).toBeInTheDocument();
      expect(
        screen.getByText('user2 - user2@example.com - admin')
      ).toBeInTheDocument();
    });
  });

  it('opens edit modal when edit button is clicked', async () => {
    localStorageMock.getItem.mockReturnValue(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.8tat9ElZ6Rhy_XyA6O5CfDNab6hSjRWl-6OhMQFWrTc'
    );
    mockedAxios.get.mockResolvedValueOnce({ data: mockUsers });

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('user-edit-form')).toBeInTheDocument();
  });

  it('deletes user when delete button is clicked', async () => {
    localStorageMock.getItem.mockReturnValue(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.8tat9ElZ6Rhy_XyA6O5CfDNab6hSjRWl-6OhMQFWrTc'
    );
    mockedAxios.get.mockResolvedValueOnce({ data: mockUsers });
    mockedAxios.delete.mockResolvedValueOnce({});

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/1');
    await waitFor(() => {
      expect(
        screen.queryByText('user1 - user1@example.com - user')
      ).not.toBeInTheDocument();
    });
  });

  it('updates user when save is clicked in edit form', async () => {
    localStorageMock.getItem.mockReturnValue(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.8tat9ElZ6Rhy_XyA6O5CfDNab6hSjRWl-6OhMQFWrTc'
    );
    mockedAxios.get.mockResolvedValueOnce({ data: mockUsers });
    mockedAxios.put.mockResolvedValueOnce({ status: 200 });

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockedAxios.put).toHaveBeenCalledWith('/api/users/1', {
      name: 'user1',
      email: 'user1@example.com',
      role: 'user',
    });
  });
});
