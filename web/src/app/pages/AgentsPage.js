import React, { useState } from 'react';
import './AgentsPage.css';
import DepositModal from '../features/deposit/DepositModal';
import WithdrawModal from '../features/withdraw/WithdrawModal';
import { useUserState } from '../providers/UserStateProvider';
import { formatCurrency } from '../lib/utils/currency';

const AgentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  
  // Get user state data
  const { synapseApiUser, isLoadingApiUser, accessKeys, isLoadingAccessKeys } = useUserState();

  // Transform access keys from API to display format
  const transformAccessKey = (key) => ({
    id: key.id,
    agent: key.name,
    apiKey: key.access_key,
    spend: key.lifetime_spend,
    created: new Date(key.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    status: key.is_active ? 'Active' : 'Deactivated'
  });

  const activeKeys = accessKeys ? accessKeys.map(transformAccessKey) : [];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('https://mcp.synapse.xyz/v1/retrieve');
  };

  const handleDeactivate = (keyId) => {
    // Handle deactivation logic
    console.log('Deactivating key:', keyId);
  };

  const handleCreateKey = () => {
    // Handle create key logic
    console.log('Creating new API key');
  };

  const handleDeposit = () => {
    setIsDepositModalOpen(true);
  };

  const handleWithdraw = () => {
    setIsWithdrawModalOpen(true);
  };

  const filteredKeys = activeKeys.filter(key => 
    key.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.apiKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="agents-page">
        <div className="page-header">
          <div className="page-content">
            <div className="section-header-left">
              <h2 className="section-header">Connect Agents</h2>
            </div>
            <p className="page-subtitle mt-2">
              Create and manage keys for your agents. Keys call into our MCP server and draw from your prepaid balance.
            </p>
            
            <div className="api-usage-section">
              <div className="usage-details">
                <div className="usage-item">
                  <label className="usage-label">MCP Server URL:</label>
                  <div className="url-container">
                    <code className="url-text">https://mcp.synapse.xyz/v1/retrieve</code>
                    <button className="copy-btn" onClick={handleCopyUrl}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="usage-item">
                  <label className="usage-label">Authentication:</label>
                  <div className="auth-example">
                    <code className="auth-text">Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="balance-section dashboard-stat-card primary">
            <div className="balance-header">
              <div className="balance-title">API CREDIT BALANCE</div>
            </div>
            
            <div className="balance-main">
              <div className="balance-amount">
                {isLoadingApiUser ? 'Loading...' : synapseApiUser ? formatCurrency(synapseApiUser.balance.toString()) : '$0.00'}
              </div>
              <div className="balance-status">Available</div>
            </div>

            <div className="balance-stats">
              <div className="stat-row">
                <span className="stat-label">Lifetime Spend</span>
                <span className="stat-value mb-0">
                  {isLoadingApiUser ? 'Loading...' : synapseApiUser ? formatCurrency(synapseApiUser.lifetimeUsage.toString()) : '$0.00'}
                </span>
              </div>
            </div>

            <div className="balance-buttons">
              <button className="btn-primary" onClick={handleDeposit}>
                Deposit
              </button>
              <button className="btn-secondary" onClick={handleWithdraw}>
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="keys-section">
          <div className="section-header-row">
            <div className="section-header-left">
              <h2 className="section-header">Manage Keys</h2>
              <button className="btn-primary" onClick={handleCreateKey}>
                Create Agent Key
              </button>
            </div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by agent or key..."
                className="form-input search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>API Key</th>
                  <th>Spend (USDC)</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingAccessKeys ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">Loading access keys...</td>
                  </tr>
                ) : filteredKeys.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No API keys found</td>
                  </tr>
                ) : (
                  filteredKeys.map((key) => (
                    <tr key={key.id}>
                      <td>{key.agent}</td>
                      <td>
                        <code className="api-key-display">{key.apiKey}</code>
                      </td>
                      <td>${key.spend.toLocaleString()}</td>
                      <td>{key.created}</td>
                      <td>
                        <span className={`status-${key.status.toLowerCase()}`}>{key.status}</span>
                      </td>
                      <td>
                        {key.status === 'Active' ? (
                          <button 
                            className="deactivate-btn"
                            onClick={() => handleDeactivate(key.id)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DepositModal 
          isOpen={isDepositModalOpen} 
          onClose={() => setIsDepositModalOpen(false)}
        />
        <WithdrawModal 
          isOpen={isWithdrawModalOpen} 
          onClose={() => setIsWithdrawModalOpen(false)}
        />
    </div>
  );
};

export default AgentsPage;
