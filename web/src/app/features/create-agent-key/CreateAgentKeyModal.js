import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { useToast } from '../../providers/ToastProvider';
import { useAccount } from 'wagmi';
import { useUserState } from '../../providers/UserStateProvider';
import { createAgentKey } from '../../lib/api/createAgentKey.ts';
import './CreateAgentKeyModal.css';

const CreateAgentKeyModal = ({ isOpen, onClose }) => {
  const [agentName, setAgentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'
  const [createdKey, setCreatedKey] = useState(null);
  
  const { address } = useAccount();
  const { refreshAccountApiKeys } = useUserState();
  const { showSuccess, showError } = useToast();

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setAgentName('');
      setStatusMessage('');
      setStatusType('');
      setCreatedKey(null);
    }
  }, [isOpen]);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!agentName.trim() || !address) return;
    
    setIsLoading(true);
    setStatusMessage('');
    setStatusType('');
    
    try {
      const result = await createAgentKey(address, agentName.trim());
      
      if (result.success) {
        // Update access keys in user state
        await refreshAccountApiKeys();
        
        // Set the created key to show it to the user
        setCreatedKey({
          name: agentName,
          access_key: result.data
        });
        
        // Show success message
        setStatusMessage(`Agent key created successfully for "${agentName}"!`);
        setStatusType('success');
        
      } else {
        setStatusMessage(result.error || 'Failed to create agent key');
        setStatusType('error');
      }
    } catch (error) {
      console.error('Failed to create agent key:', error);
      setStatusMessage('An unexpected error occurred while creating the agent key');
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentNameChange = (e) => {
    setAgentName(e.target.value);
  };

  const handleCopyKey = () => {
    if (createdKey?.access_key) {
      navigator.clipboard.writeText(createdKey.access_key);
      showSuccess('API key copied to clipboard!');
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  const actions = createdKey ? (
    <>
      <button 
        type="button" 
        className="btn-primary"
        onClick={handleCloseModal}
      >
        Done
      </button>
    </>
  ) : (
    <>
      <button 
        type="button" 
        className="btn-secondary"
        onClick={onClose}
        disabled={isLoading}
      >
        Cancel
      </button>
      <button 
        type="submit" 
        className="btn-primary"
        form="create-key-form"
        disabled={isLoading || !agentName.trim()}
      >
        {isLoading ? 'Creating...' : 'Create Key'}
      </button>
    </>
  );

  return (
    <div className="create-agent-key-modal">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create Agent Key"
        actions={actions}
        maxWidth="480px"
      >
        <div className="create-agent-key-modal-content">
          {!createdKey ? (
            <>
              <p className="create-key-description">
                Create a new API key for your agent. This key will be used to authenticate requests to the MCP server.
              </p>

              <form id="create-key-form" onSubmit={handleCreateKey} className="create-key-form">
                <div className="form-group mb-0">
                  <label htmlFor="agent-name" className="form-label">
                    Agent Name
                  </label>
                  <input
                    id="agent-name"
                    type="text"
                    className="form-input"
                    value={agentName}
                    onChange={handleAgentNameChange}
                    placeholder="Enter agent name (e.g., Claude, GPT-4, etc.)"
                    disabled={isLoading}
                    maxLength={50}
                  />
                  <div className="form-help">
                    Choose a descriptive name to identify this agent key
                  </div>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="key-created-success">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="success-title">API Key Created Successfully!</h3>
                <p className="success-description">
                  Your API key has been created for "{createdKey.name}". Please copy and store it in a safe place.
                </p>
                <p className="security-warning">
                  ⚠️ This is the only time you will see this key. Make sure to copy it now!
                </p>
              </div>

              <div className="key-display">
                <label className="key-label">Your API Key:</label>
                <div className="key-container">
                  <code className="key-text">{createdKey.access_key}</code>
                  <button 
                    className="copy-key-btn"
                    onClick={handleCopyKey}
                    title="Copy API key"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Status Message */}
          {statusMessage && !createdKey && (
            <div className={`status-message ${statusType}`}>
              {statusMessage}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreateAgentKeyModal;
