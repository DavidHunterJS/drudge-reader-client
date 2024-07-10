import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import PasswordResetPage from './PasswordResetPage';

jest.mock('axios');

describe('PasswordResetPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ...

  it('renders the password reset form', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=123']}>
        <Routes>
          <Route path="/reset-password" element={<PasswordResetPage />} />
        </Routes>
      </MemoryRouter>
    );
    // ...
  });

  it('displays an error when passwords do not match', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=123']}>
        <Routes>
          <Route path="/reset-password" element={<PasswordResetPage />} />
        </Routes>
      </MemoryRouter>
    );
    // ...
  });

  it('submits the form and displays success message', async () => {
    // ...
    render(
      <MemoryRouter initialEntries={['/reset-password?token=123']}>
        <Routes>
          <Route path="/reset-password" element={<PasswordResetPage />} />
        </Routes>
      </MemoryRouter>
    );
    // ...
  });

  it('displays an error when password reset fails', async () => {
    // ...
    render(
      <MemoryRouter initialEntries={['/reset-password?token=123']}>
        <Routes>
          <Route path="/reset-password" element={<PasswordResetPage />} />
        </Routes>
      </MemoryRouter>
    );
    // ...
  });
});
