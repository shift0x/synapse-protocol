import React, { useState } from 'react';
import Modal from '../components/Modal';
import './BorrowLendPage.css';

const BorrowLendPage = () => {
  const [activeView, setActiveView] = useState('borrow');
  const [selectedCollateral, setSelectedCollateral] = useState([]);
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [lendAmount, setLendAmount] = useState(0);
  const [loanTerm, setLoanTerm] = useState(90);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showLendModal, setShowLendModal] = useState(false);
  const [selectedCollateralForBorrow, setSelectedCollateralForBorrow] = useState(null);
  const [selectedPoolForLend, setSelectedPoolForLend] = useState(null);

  // Sample data - replace with real API data
  const marketMetrics = {
    totalSupplied: 1247832.45,
    totalBorrowed: 623916.22,
    utilizationRate: 50.1,
    avgApy: 12.3
  };

  const userTokens = [
    {
      id: 1,
      expert: 'Sarah Chen',
      category: 'DevOps',
      lifetimeEarnings: 2847.32,
      createdDate: '2024-01-15',
      estimatedAnnualEarnings: 4200.00,
      maxBorrowable: 2100.00,
      currentUtilization: 0
    },
    {
      id: 2,
      expert: 'Mike Rodriguez',
      category: 'Sales',
      lifetimeEarnings: 1923.45,
      createdDate: '2024-02-20',
      estimatedAnnualEarnings: 3500.00,
      maxBorrowable: 1750.00,
      currentUtilization: 35.2
    },
    {
      id: 3,
      expert: 'Dr. Kim Park',
      category: 'Security',
      lifetimeEarnings: 3421.78,
      createdDate: '2023-11-10',
      estimatedAnnualEarnings: 5800.00,
      maxBorrowable: 2900.00,
      currentUtilization: 0
    }
  ];

  const activeLoans = [
    {
      id: 1,
      amount: 1500.00,
      collateral: 'Sarah Chen Token',
      interestRate: 15.0,
      term: 180,
      daysRemaining: 142,
      monthlyPayment: 127.34,
      totalOwed: 1687.50
    }
  ];

  const lendingPools = [
    {
      category: 'DevOps',
      totalValue: 284730.45,
      apy: 13.2,
      utilization: 78.3,
      avgLoanTerm: 156
    },
    {
      category: 'Sales',
      totalValue: 192340.22,
      apy: 11.8,
      utilization: 65.1,
      avgLoanTerm: 134
    },
    {
      category: 'Security',
      totalValue: 156780.33,
      apy: 14.7,
      utilization: 82.4,
      avgLoanTerm: 178
    }
  ];

  const userDeposits = [
    {
      id: 1,
      pool: 'DevOps Pool',
      amount: 5000.00,
      apy: 13.2,
      accruedInterest: 234.56,
      depositDate: '2024-03-15'
    },
    {
      id: 2,
      pool: 'Security Pool',
      amount: 3000.00,
      apy: 14.7,
      accruedInterest: 189.22,
      depositDate: '2024-04-02'
    }
  ];

  const handleCollateralSelect = (tokenId) => {
    setSelectedCollateral(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const handleOpenBorrowModal = (token) => {
    setSelectedCollateralForBorrow(token);
    setSelectedCollateral([token.id]);
    setBorrowAmount(0);
    setShowBorrowModal(true);
  };

  const handleOpenLendModal = (pool) => {
    setSelectedPoolForLend(pool);
    setLendAmount(0);
    setShowLendModal(true);
  };

  const getMaxBorrowable = () => {
    if (selectedCollateralForBorrow) {
      return selectedCollateralForBorrow.maxBorrowable;
    }
    return selectedCollateral.reduce((total, tokenId) => {
      const token = userTokens.find(t => t.id === tokenId);
      return total + (token ? token.maxBorrowable : 0);
    }, 0);
  };

  const calculateMonthlyPayment = (amount, rate, termDays) => {
    const monthlyRate = (rate / 100) / 12;
    const months = termDays / 30;
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  const renderBorrowModal = () => (
    <Modal
      isOpen={showBorrowModal}
      onClose={() => setShowBorrowModal(false)}
      title="Borrow Against Future Earnings"
      actions={
        <>
          <button 
            className="borrowlend-action-btn secondary"
            onClick={() => setShowBorrowModal(false)}
          >
            Cancel
          </button>
          <button 
            className="borrowlend-action-btn primary"
            disabled={borrowAmount === 0 || !selectedCollateralForBorrow}
          >
            Get Loan
          </button>
        </>
      }
    >
      {selectedCollateralForBorrow && (
        <div className="borrowlend-collateral-details">
          <h4>Collateral Details</h4>
          <div className="borrowlend-collateral-summary">
            <div className="borrowlend-collateral-header">
              <div className="borrowlend-collateral-info">
                <span className="borrowlend-expert-name">{selectedCollateralForBorrow.expert}</span>
                <span className="borrowlend-token-category">{selectedCollateralForBorrow.category}</span>
              </div>
            </div>
            <div className="borrowlend-collateral-metrics">
              <div className="borrowlend-collateral-metric">
                <span className="borrowlend-metric-label">Earnings</span>
                <span className="borrowlend-metric-value">${selectedCollateralForBorrow.lifetimeEarnings.toLocaleString()}</span>
              </div>
              <div className="borrowlend-collateral-metric">
                <span className="borrowlend-metric-label">Est. Annual</span>
                <span className="borrowlend-metric-value">${selectedCollateralForBorrow.estimatedAnnualEarnings.toLocaleString()}</span>
              </div>
              <div className="borrowlend-collateral-metric">
                <span className="borrowlend-metric-label">Max Borrow</span>
                <span className="borrowlend-metric-value highlight">${selectedCollateralForBorrow.maxBorrowable.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="borrowlend-calculator">
        <div className="borrowlend-input-group">
          <label className="borrowlend-input-label">Loan Amount (USDC)</label>
          <div className="borrowlend-input-container">
            <input
              type="number"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(parseFloat(e.target.value) || 0)}
              max={getMaxBorrowable()}
              className="borrowlend-amount-input"
              placeholder="0.00"
            />
            <span className="borrowlend-input-suffix">USDC</span>
          </div>
          <div className="borrowlend-amount-info">
            <span>Max available: ${getMaxBorrowable().toLocaleString()}</span>
          </div>
        </div>

        <div className="borrowlend-input-group">
          <label className="borrowlend-input-label">Loan Term</label>
          <div className="borrowlend-term-options">
            {[30, 90, 180, 365].map((days) => (
              <button
                key={days}
                className={`borrowlend-term-btn ${loanTerm === days ? 'active' : ''}`}
                onClick={() => setLoanTerm(days)}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        <div className="borrowlend-loan-summary">
          <div className="borrowlend-summary-row">
            <span>Interest Rate</span>
            <span className="borrowlend-rate">15.0% APY</span>
          </div>
          <div className="borrowlend-summary-row">
            <span>Total Interest</span>
            <span>${borrowAmount > 0 ? ((borrowAmount * 15 / 100) * (loanTerm / 365)).toFixed(2) : '0.00'}</span>
          </div>
          <div className="borrowlend-summary-row total">
            <span>Total Repayment</span>
            <span>${borrowAmount > 0 ? (borrowAmount + (borrowAmount * 15 / 100) * (loanTerm / 365)).toFixed(2) : '0.00'}</span>
          </div>
        </div>
      </div>
    </Modal>
  );

  const renderLendModal = () => (
    <Modal
      isOpen={showLendModal}
      onClose={() => setShowLendModal(false)}
      title="Supply Liquidity"
      actions={
        <>
          <button 
            className="borrowlend-action-btn secondary"
            onClick={() => setShowLendModal(false)}
          >
            Cancel
          </button>
          <button 
            className="borrowlend-action-btn primary"
            disabled={lendAmount === 0}
          >
            Supply Liquidity
          </button>
        </>
      }
    >
      {selectedPoolForLend && (
        <div className="borrowlend-collateral-details">
          <h4>Pool Information</h4>
          <div className="borrowlend-collateral-summary">
            <div className="borrowlend-collateral-header">
              <div className="borrowlend-collateral-info">
                <span className="borrowlend-expert-name">{selectedPoolForLend.category} Pool</span>
                <span className="borrowlend-token-category">Lending Pool</span>
              </div>
            </div>
            <div className="borrowlend-collateral-metrics">
              <div className="borrowlend-collateral-metric">
                <span className="borrowlend-metric-label">APY</span>
                <span className="borrowlend-metric-value highlight">{selectedPoolForLend.apy}%</span>
              </div>
              <div className="borrowlend-collateral-metric">
                <span className="borrowlend-metric-label">Pool Size</span>
                <span className="borrowlend-metric-value">${(selectedPoolForLend.totalValue / 1000).toFixed(0)}K</span>
              </div>
              <div className="borrowlend-collateral-metric">
                <span className="borrowlend-metric-label">Utilization</span>
                <span className="borrowlend-metric-value">{selectedPoolForLend.utilization}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="borrowlend-calculator">
        <div className="borrowlend-input-group">
          <label className="borrowlend-input-label">Deposit Amount (USDC)</label>
          <div className="borrowlend-input-container">
            <input
              type="number"
              value={lendAmount}
              onChange={(e) => setLendAmount(parseFloat(e.target.value) || 0)}
              className="borrowlend-amount-input"
              placeholder="0.00"
            />
            <span className="borrowlend-input-suffix">USDC</span>
          </div>
          <div className="borrowlend-amount-info">
            <span>Balance: $12,547 USDC</span>
          </div>
        </div>
        
        <div className="borrowlend-yield-summary">
          <div className="borrowlend-summary-row">
            <span>Expected APY</span>
            <span className="borrowlend-rate">{selectedPoolForLend ? selectedPoolForLend.apy : marketMetrics.avgApy}%</span>
          </div>
          <div className="borrowlend-summary-row">
            <span>Monthly Earnings</span>
            <span>${lendAmount > 0 ? ((lendAmount * (selectedPoolForLend ? selectedPoolForLend.apy : marketMetrics.avgApy) / 100) / 12).toFixed(2) : '0.00'}</span>
          </div>
          <div className="borrowlend-summary-row">
            <span>Annual Earnings</span>
            <span>${lendAmount > 0 ? (lendAmount * (selectedPoolForLend ? selectedPoolForLend.apy : marketMetrics.avgApy) / 100).toFixed(2) : '0.00'}</span>
          </div>
        </div>
      </div>
    </Modal>
  );

  const renderBorrowView = () => (
    <div className="borrowlend-content">
      <div className="borrowlend-tables-grid">
        <div className="borrowlend-table-section borrowlend-single-table">
          <div className="borrowlend-table-header">
            <h3 className="borrowlend-table-title">Your Collateral</h3>
            <span className="borrowlend-table-subtitle">Available knowledge tokens for borrowing</span>
          </div>
          <div className="borrowlend-table-container">
            <table className="borrowlend-table">
              <thead>
                <tr>
                  <th>Expert</th>
                  <th>Category</th>
                  <th>Lifetime Earnings</th>
                  <th>Est. Annual</th>
                  <th>Max Borrowable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userTokens.map((token) => (
                  <tr key={token.id}>
                    <td>{token.expert}</td>
                    <td>
                      <span className="borrowlend-category-tag">{token.category}</span>
                    </td>
                    <td>${token.lifetimeEarnings.toLocaleString()}</td>
                    <td>${token.estimatedAnnualEarnings.toLocaleString()}</td>
                    <td className="borrowlend-highlight">${token.maxBorrowable.toLocaleString()}</td>
                    <td>
                      <button 
                        className="borrowlend-action-btn small"
                        onClick={() => handleOpenBorrowModal(token)}
                      >
                        Borrow
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="borrowlend-table-section">
          <div className="borrowlend-table-header">
            <h3 className="borrowlend-table-title">Active Loans</h3>
            <span className="borrowlend-table-subtitle">Your current borrowing positions</span>
          </div>
          <div className="borrowlend-table-container">
            {activeLoans.length > 0 ? (
              <div className="borrowlend-active-loans-list">
                {activeLoans.map((loan) => {
                  const progressPercent = ((loan.term - loan.daysRemaining) / loan.term) * 100;
                  return (
                    <div key={loan.id} className="borrowlend-loan-card">
                      <div className="borrowlend-loan-header">
                        <div>
                          <div className="borrowlend-loan-amount">
                            ${loan.amount.toLocaleString()}
                          </div>
                          <div className="borrowlend-loan-collateral">
                            Collateral: {loan.collateral}
                          </div>
                        </div>
                      </div>

                      <div className="borrowlend-loan-details">
                        <div className="borrowlend-loan-details-grid">
                          <div className="borrowlend-loan-detail-item">
                            <span className="borrowlend-loan-detail-label">Interest Rate</span>
                            <span className="borrowlend-loan-detail-value">{loan.interestRate}%</span>
                          </div>
                          <div className="borrowlend-loan-detail-item">
                            <span className="borrowlend-loan-detail-label">Days Remaining</span>
                            <span className="borrowlend-loan-detail-value">{loan.daysRemaining}</span>
                          </div>
                          <div className="borrowlend-loan-detail-item">
                            <span className="borrowlend-loan-detail-label">Monthly Payment</span>
                            <span className="borrowlend-loan-detail-value">${loan.monthlyPayment}</span>
                          </div>
                          <div className="borrowlend-loan-detail-item">
                            <span className="borrowlend-loan-detail-label">Total Owed</span>
                            <span className="borrowlend-loan-detail-value highlight">${loan.totalOwed.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="borrowlend-loan-progress">
                          <div className="borrowlend-loan-progress-header">
                            <span>Loan Progress</span>
                            <span>{Math.round(progressPercent)}% Complete</span>
                          </div>
                          <div className="borrowlend-loan-progress-bar">
                            <div 
                              className="borrowlend-loan-progress-fill"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="borrowlend-loan-actions">
                        <button className="borrowlend-action-btn small secondary">
                          Make Payment
                        </button>
                        <button className="borrowlend-action-btn small secondary">
                          Repay Early
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="borrowlend-empty-table">
                <p>No active loans</p>
                <span>Borrow against your knowledge tokens to access liquidity</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLendView = () => {
    // Create a function to get user deposit for a specific pool
    const getUserDeposit = (poolCategory) => {
      return userDeposits.find(deposit => deposit.pool.toLowerCase().includes(poolCategory.toLowerCase()));
    };

    return (
      <div className="borrowlend-content">
        <div className="borrowlend-tables-grid">
          <div className="borrowlend-table-section borrowlend-single-table">
            <div className="borrowlend-table-header">
              <h3 className="borrowlend-table-title">Lending Pools</h3>
              <span className="borrowlend-table-subtitle">Available pools for earning yield with your current positions</span>
            </div>
            <div className="borrowlend-table-container">
              <table className="borrowlend-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>APY</th>
                    <th>Pool Size</th>
                    <th>Your Deposit</th>
                    <th>Accrued Interest</th>
                    <th>Utilization</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lendingPools.map((pool, index) => {
                    const userDeposit = getUserDeposit(pool.category);
                    const hasDeposit = !!userDeposit;
                    
                    return (
                      <tr key={index}>
                        <td>
                          <span className="borrowlend-category-tag">{pool.category}</span>
                        </td>
                        <td className="borrowlend-highlight">{pool.apy}%</td>
                        <td>${(pool.totalValue / 1000).toFixed(0)}K</td>
                        <td>
                          {hasDeposit ? (
                            <span className="borrowlend-highlight">${userDeposit.amount.toLocaleString()}</span>
                          ) : (
                            <span className="borrowlend-empty-value">$0</span>
                          )}
                        </td>
                        <td>
                          {hasDeposit ? (
                            <span className="borrowlend-positive">+${userDeposit.accruedInterest}</span>
                          ) : (
                            <span className="borrowlend-empty-value">$0</span>
                          )}
                        </td>
                        <td>
                          <div className="borrowlend-utilization-cell">
                            <span>{pool.utilization}%</span>
                            <div className="borrowlend-progress-bar small">
                              <div 
                                className="borrowlend-progress-fill" 
                                style={{ width: `${pool.utilization}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="borrowlend-table-actions">
                            <button className="borrowlend-action-btn small" 
                              onClick={() => handleOpenLendModal(pool)}
                            >
                              Add Liquidity
                            </button>
                            <button 
                              className={`borrowlend-action-btn small secondary ${!hasDeposit ? 'disabled' : ''}`}
                              disabled={!hasDeposit}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="borrowlend-page">
      <div className="borrowlend-header">
        <div className="borrowlend-title-section">
          <h2 className="borrowlend-title">Borrow & Lend</h2>
          <p className="borrowlend-subtitle">
            Borrow against future knowledge earnings or supply liquidity to earn yield
          </p>
        </div>

        <div className="borrowlend-view-switcher">
          <button 
            className={`borrowlend-view-btn ${activeView === 'borrow' ? 'active' : ''}`}
            onClick={() => setActiveView('borrow')}
          >
            Borrow
          </button>
          <button 
            className={`borrowlend-view-btn ${activeView === 'lend' ? 'active' : ''}`}
            onClick={() => setActiveView('lend')}
          >
            Lend
          </button>
        </div>
      </div>

      <div className="borrowlend-metrics">
        <div className="borrowlend-metric-card">
          <span className="stat-label">Total Supplied</span>
          <div className="stat-value">${(marketMetrics.totalSupplied / 1000000).toFixed(1)}M</div>
        </div>
        <div className="borrowlend-metric-card">
          <span className="stat-label">Total Borrowed</span>
          <div className="stat-value">${(marketMetrics.totalBorrowed / 1000000).toFixed(1)}M</div>
        </div>
        <div className="borrowlend-metric-card">
          <span className="stat-label">Utilization</span>
          <div className="stat-value">{marketMetrics.utilizationRate}%</div>
        </div>
        <div className="borrowlend-metric-card">
          <span className="stat-label">Avg APY</span>
          <div className="stat-value">{marketMetrics.avgApy}%</div>
        </div>
      </div>

      {activeView === 'borrow' ? renderBorrowView() : renderLendView()}
      
      {renderBorrowModal()}
      {renderLendModal()}
    </div>
  );
};

export default BorrowLendPage;
