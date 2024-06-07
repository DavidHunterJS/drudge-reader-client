// adminDashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal'; // Import the Modal component
import UserEditForm from './userEditForm'; // Import the User Edit Form component
const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_ENDPOINT || ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';

const axiosInstance = axios.create({
  baseURL: ENDPOINT,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        // Decode the token to get the username
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const username = decodedToken.username;

        setIsAdmin(true);
        setAdminData({ username });
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleEditUser = (user: User): void => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this user?'
      );
      if (confirmDelete) {
        await axiosInstance.delete(`/api/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSave = async (editedUser: User) => {
    try {
      // Extract the necessary fields from the editedUser object
      const { id, username, email, role } = editedUser;

      // Make an API request to update the user on the server
      const response = await axiosInstance.put(`/api/users/${editedUser.id}`, {
        name: username,
        email,
        role,
      });

      if (response.status === 200) {
        // If the update is successful, update the users state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editedUser.id ? editedUser : user
          )
        );
        setModalOpen(false); // Close the modal
      } else {
        console.error('Error updating user:', response.status);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null; // Render nothing if the user is not an admin
  }

  return (
    <div className="container">
      <h2 className="mb-4">Admin Dashboard</h2>
      {adminData && adminData.username && (
        <div>
          <p>Welcome, {adminData.username}!</p>
        </div>
      )}
      <h3 className="mt-4">User List</h3>
      <div className="list-group">
        {users.map((user) => (
          <div
            key={user.id}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <div>
              {user.username} - {user.email} - {user.role}
            </div>
            <div>
              <button
                className="btn btn-primary btn-sm me-2"
                onClick={() => handleEditUser(user)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        {selectedUser && (
          <UserEditForm user={selectedUser} onSave={handleSave} />
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
