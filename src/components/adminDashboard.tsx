// adminDashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal'; // Import the Modal component
import UserEditForm from './userEditForm'; // Import the User Edit Form component
const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? ''
    : process.env.REACT_APP_DEV_ENDPOINT || '';

const axiosInstance = axios.create({
  baseURL: ENDPOINT,
});
interface User {
  id: string;
  username: string;
  email: string;
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
        const response = await axiosInstance.get('/api/admin-dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAdmin(true);
        setAdminData(response.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
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
      await axiosInstance.delete(`/api/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSave = async (updatedUser: User) => {
    try {
      // Make an API request to update the user on the server
      const response = await axiosInstance.put(
        `/api/users/${updatedUser.id}`,
        updatedUser
      );

      if (response.status === 200) {
        // If the update is successful, update the users state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
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
    <div>
      <h2>Admin Dashboard</h2>
      {adminData && (
        <div>
          <p>Welcome, {adminData.username}!</p>
        </div>
      )}
      <h3>User List</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email}
            <button onClick={() => handleEditUser(user)}>Edit</button>
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        {selectedUser && (
          <UserEditForm user={selectedUser} onSave={handleSave} />
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
