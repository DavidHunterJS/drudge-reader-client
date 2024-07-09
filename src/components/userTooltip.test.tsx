import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import useTooltip from './useTooltip';

// A test component that uses the hook
const TestComponent = () => {
  const handleMouseMove = useTooltip();
  return (
    <li onMouseMove={handleMouseMove}>
      <div className="tooltipimg" data-testid="tooltip"></div>
    </li>
  );
};

describe('useTooltip', () => {
  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      x: 50,
      y: 50,
      left: 50,
      top: 50,
      right: 150,
      bottom: 150,
      width: 100,
      height: 100,
      toJSON: () => ({}),
    }));
  });

  it('should update tooltip position on mouse move', () => {
    const { getByRole, getByTestId } = render(<TestComponent />);
    const listItem = getByRole('listitem');
    const tooltip = getByTestId('tooltip');

    fireEvent.mouseMove(listItem, {
      clientX: 100,
      clientY: 100,
    });

    expect(tooltip).toHaveStyle('left: 60px'); // 100 - 50 + 10
    expect(tooltip).toHaveStyle('top: 60px'); // 100 - 50 + 10
  });

  it('should use correct offsets', () => {
    const { getByRole, getByTestId } = render(<TestComponent />);
    const listItem = getByRole('listitem');
    const tooltip = getByTestId('tooltip');

    fireEvent.mouseMove(listItem, {
      clientX: 75,
      clientY: 75,
    });

    expect(tooltip).toHaveStyle('left: 35px'); // 75 - 50 + 10
    expect(tooltip).toHaveStyle('top: 35px'); // 75 - 50 + 10
  });

  it('should handle multiple mouse move events', () => {
    const { getByRole, getByTestId } = render(<TestComponent />);
    const listItem = getByRole('listitem');
    const tooltip = getByTestId('tooltip');

    fireEvent.mouseMove(listItem, {
      clientX: 100,
      clientY: 100,
    });

    expect(tooltip).toHaveStyle('left: 60px');
    expect(tooltip).toHaveStyle('top: 60px');

    fireEvent.mouseMove(listItem, {
      clientX: 150,
      clientY: 150,
    });

    expect(tooltip).toHaveStyle('left: 110px');
    expect(tooltip).toHaveStyle('top: 110px');
  });
});
