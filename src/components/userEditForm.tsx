// userEditForm.tsx
import { log } from 'console';
import React, { useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  // Include any other properties that a User object should have
}

interface UserEditFormProps {
  user: User;
  onSave: (user: User) => void;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ user, onSave }) => {
  const [editedUser, setEditedUser] = useState<User>({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    // Initialize any other necessary properties here
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = event.target.value;
    setEditedUser((prevUser) => ({
      ...prevUser,
      role: selectedRole,
    }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(editedUser); // Pass the edited user back to the parent component
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="username" className="form-label">
          Username:
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={editedUser.username}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={editedUser.email}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="role" className="form-label">
          Role:
        </label>
        <select
          id="role"
          name="role"
          value={editedUser.role}
          onChange={handleRoleChange}
          className="form-select"
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary">
        Save Changes
      </button>
    </form>
  );
};

export default UserEditForm;
