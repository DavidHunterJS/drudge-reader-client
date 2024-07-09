import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from './Modal';

describe('Modal', () => {
  const mockOnClose = jest.fn();
  const modalContent = <p>Test Modal Content</p>;

  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        {modalContent}
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        {modalContent}
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByText('Test Modal Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        {modalContent}
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders children content', () => {
    const customContent = (
      <div data-testid="custom-content">Custom Modal Content</div>
    );
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        {customContent}
      </Modal>
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Modal Content')).toBeInTheDocument();
  });

  it('has the correct CSS classes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        {modalContent}
      </Modal>
    );

    const modalElement = screen.getByRole('dialog');
    expect(modalElement).toHaveClass('modal');
    expect(modalElement).toHaveClass('show');
    expect(modalElement).toHaveClass('d-block');

    const dialogElement = screen.getByRole('document');
    expect(dialogElement).toHaveClass('modal-dialog');

    const contentElement = dialogElement.firstChild;
    expect(contentElement).toHaveClass('modal-content');
  });
});
