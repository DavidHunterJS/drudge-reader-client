// App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);

  // Assert that the app title is rendered
  const titleElement = screen.getByText(/Drudge/i);
  expect(titleElement).toBeInTheDocument();
});
