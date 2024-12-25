import { IoClose } from "react-icons/io5";

function Settings({ isOpen, onClose, theme, onThemeChange }) {
  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <button className="close-btn" onClick={onClose}>
          <IoClose size={24} />
        </button>
        <h2>Settings</h2>
        <div className="settings-section">
          <h3>Theme</h3>
          <div className="theme-options">
            <button 
              className={`theme-btn ${theme === 'gold' ? 'active' : ''}`}
              onClick={() => onThemeChange('gold')}
            >
              Gold
            </button>
            <button 
              className={`theme-btn ${theme === 'blue' ? 'active' : ''}`}
              onClick={() => onThemeChange('blue')}
            >
              Blue
            </button>
            <button 
              className={`theme-btn ${theme === 'green' ? 'active' : ''}`}
              onClick={() => onThemeChange('green')}
            >
              Green
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 