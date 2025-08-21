import React, { useState } from 'react';
import './AgentsPage.css';
import DepositModal from '../features/deposit/DepositModal';
import { useUserState } from '../providers/UserStateProvider';
import { formatCurrency } from '../lib/utils/currency';

const AgentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  // Get user state data
  const { synapseApiUser, isLoadingApiUser } = useUserState();

  // Sample data - replace with real API data
  const activeKeys = [
    {
      id: 1,
      agent: 'Research-call Bot',
      apiKey: 'sk_live_4f9d...6b0',
      spend: 482.13,
      created: 'Apr 12, 2025',
      status: 'Active'
    },
    {
      id: 2,
      agent: 'Sales Assistant',
      apiKey: 'sk_live_b21c...8a4e',
      spend: 329.77,
      created: 'Mar 29, 2025',
      status: 'Active'
    },
    {
      id: 3,
      agent: 'Logic QA',
      apiKey: 'sk_live_91ef...c09a',
      spend: 118.04,
      created: 'Mar 03, 2025',
      status: 'Active'
    },
    {
      id: 4,
      agent: 'Sandbox Agent',
      apiKey: 'sk_live_0a7b...2fd1',
      spend: 12.66,
      created: 'May 01, 2025',
      status: 'Active'
    }
  ];

  const deactivatedKeys = [
    {
      id: 5,
      agent: 'Old Research Bot',
      apiKey: 'sk_live_8x2n...4k1m',
      spend: 156.42,
      created: 'Feb 15, 2025',
      status: 'Deactivated'
    }
  ];

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
    // Handle withdraw logic
    console.log('Opening withdraw modal');
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
                {filteredKeys.map((key) => (
                  <tr key={key.id}>
                    <td>{key.agent}</td>
                    <td>
                      <code className="api-key-display">{key.apiKey}</code>
                    </td>
                    <td>{key.spend.toLocaleString()}</td>
                    <td>{key.created}</td>
                    <td>
                      <span className="status-active">{key.status}</span>
                    </td>
                    <td>
                      <button 
                        className="deactivate-btn"
                        onClick={() => handleDeactivate(key.id)}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <div className="pagination-info">
              <span>Rows per page</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => setRowsPerPage(e.target.value)}
                className="rows-select"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>1 / 3</span>
            </div>
          </div>
        </div>

        <DepositModal 
          isOpen={isDepositModalOpen} 
          onClose={() => setIsDepositModalOpen(false)}
        />
    </div>
  );
};

export default AgentsPage;
