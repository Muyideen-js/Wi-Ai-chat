import { IoWarningOutline } from "react-icons/io5";

function ConfirmModal({ isOpen, onClose, onConfirm, aiName }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <div className="confirm-icon">
          <IoWarningOutline size={40} />
        </div>
        <h3>Switch AI Model?</h3>
        <p>Are you sure you want to switch to <span className="ai-name">{aiName}</span>?</p>
        <p className="confirm-note">Your current conversation will continue with the new AI.</p>
        <div className="confirm-buttons">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={onConfirm} className="confirm-btn">
            Yes, Switch
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
