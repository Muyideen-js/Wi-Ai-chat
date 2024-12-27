import React from 'react';
import '../styles/CustomAlert.css';
import '../styles/Modal.css';
import { IoCloseCircleOutline } from 'react-icons/io5';

function CustomAlert({ message, onClose }) {
  return (
    <div className="alert-overlay">
      <div className="custom-alert">
        <div className="alert-icon">
          <IoCloseCircleOutline size={40} />
        </div>
        <h3>Error Occurred</h3>
        <p>{message}</p>
        <button onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

export default CustomAlert; 