// userEditForm.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserEditForm from './userEditForm';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

describe('UserEditForm', () => {
  const mockUser: User = {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    role: 'USER',
  };

  const mockOnSave = jest.fn();

  beforeEach(() => {
    render(<UserEditForm user={mockUser} onSave={mockOnSave} />);
  });

  test('renders the form fields with correct initial values', () => {
    const usernameInput = screen.getByLabelText('Username:');
    const emailInput = screen.getByLabelText('Email:');
    const roleSelect = screen.getByLabelText('Role:');

    expect(usernameInput).toHaveValue(mockUser.username);
    expect(emailInput).toHaveValue(mockUser.email);
    expect(roleSelect).toHaveValue(mockUser.role);
  });

  test('updates the form fields when the user types', () => {
    const usernameInput = screen.getByLabelText('Username:');
    const emailInput = screen.getByLabelText('Email:');

    fireEvent.change(usernameInput, { target: { value: 'janedoe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });

    expect(usernameInput).toHaveValue('janedoe');
    expect(emailInput).toHaveValue('jane@example.com');
  });

  test('calls the onSave function with the edited user when the form is submitted', () => {
    const usernameInput = screen.getByLabelText('Username:');
    const emailInput = screen.getByLabelText('Email:');
    const roleSelect = screen.getByLabelText('Role:');
    const saveButton = screen.getByText('Save Changes');

    fireEvent.change(usernameInput, { target: { value: 'janedoe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'ADMIN' } });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      id: mockUser.id,
      username: 'janedoe',
      email: 'jane@example.com',
      role: 'ADMIN',
    });
  });
});
