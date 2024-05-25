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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(editedUser); // Pass the edited user back to the parent component
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={editedUser.username}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={editedUser.email}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Save Changes</button>
    </form>
  );
};

export default UserEditForm;
