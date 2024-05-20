// Modal.tsx
import React from 'react';
import './Modal.css';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        {children}
        <button onClick={onClose} className="">
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
