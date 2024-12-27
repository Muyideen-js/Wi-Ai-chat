import React from 'react';
import { IoWarningOutline } from "react-icons/io5";

const ConfirmModal = ({ isOpen, onClose, onConfirm, aiName }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <div className="confirm-icon">
          <IoWarningOutline size={30} />
        </div>
        <h3>Switch to {aiName}?</h3>
        <p>Your current conversation will continue with {aiName}</p>
        <div className="confirm-buttons">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="confirm-btn" onClick={onConfirm}>Switch</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
