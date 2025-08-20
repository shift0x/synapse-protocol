import React, { useState } from 'react';
import './Swap.css';

const Swap = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Top');
  const [isSwapping, setIsSwapping] = useState('Buy');
  const [payAmount, setPayAmount] = useState('500');
  const [receiveAmount, setReceiveAmount] = useState('203.71');

  const tokens = [
    {
      id: 'EXP-001',
      name: 'revops',
      price: '2.41',
      change: '+4.2%',
      changePercent: '+4.2%',
      marketCap: '32M',
      lifetimeEarnings: '14.2K',
      yield: 3.2,
      currency: 'USDC',
      isPositive: true
    },
    {
      id: 'EXP-014',
      name: 'Salce Discovery',
      price: '118',
      change: '+2.0%',
      changePercent: '+2.5%',
      marketCap: '128M',
      lifetimeEarnings: '67.8K',
      yield: 4.66,
      currency: 'USDC',
      isPositive: true
    },
    {
      id: 'EXP-009',
      name: 'Security Triage',
      price: '0.34',
      change: '-1.3%',
      changePercent: '-1.2%',
      marketCap: '98M',
      lifetimeEarnings: '45.1K',
      yield: 8.32,
      currency: 'USDC',
      isPositive: false
    },
    {
      id: 'EXP-023',
      name: 'Tier 2 Support',
      price: '0.72',
      change: '+0.8%',
      changePercent: '+0.2%',
      marketCap: '55M',
      lifetimeEarnings: '23.9K',
      yield: 1.25,
      currency: 'USDC',
      isPositive: true
    },
    {
      id: 'EXP-005',
      name: 'Data Eng Punbooks',
      price: '167',
      change: '+7.1%',
      changePercent: '+7.1%',
      marketCap: '204M',
      lifetimeEarnings: '156.3K',
      yield: 7.83,
      currency: 'USDC',
      isPositive: true
    },
    {
      id: 'EXP-017',
      name: 'Product Heuristics',
      price: '0.53',
      change: '-0.6%',
      changePercent: '-0.9%',
      marketCap: '34M',
      lifetimeEarnings: '18.7K',
      yield: 4.67,
      currency: 'USDC',
      isPositive: false
    }
  ];

  const filters = ['Top', 'Rising', 'New', 'Verified'];

  return (
    <div className="swap-page">
      <div className="page-header">
        <div className="page-content">
          <div className="section-header-left">
            <h2 className="section-header mb-0">Swap Knowledge Tokens</h2>
          </div>
          <p className="page-subtitle mt-2">
             Discover and trade tokens representing contributor earnings.<br />
            Low fees | Instant settlement on Sei.
          </p>
        </div>
      </div>

      <div className="swap-content">
        <div className="swap-left-panel">
          <div className="search-section">
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="21 21l-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search contributors, tokens, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="tokens-list">
            {tokens.map(token => (
              <div key={token.id} className="token-row">
                <div className="token-info">
                  <div className="token-avatar">
                    <div className="avatar-circle">
                      {token.id.split('-')[1]}
                    </div>
                  </div>
                  <div className="token-details">
                    <div className="token-id">{token.id}</div>
                    <div className="token-name">{token.name}</div>
                  </div>
                </div>

                <div className="token-price">
                  <div className="price-value">${token.price}</div>
                  <div className="price-currency">{token.currency}</div>
                </div>

                <div className="token-chart">
                  <div className="chart-placeholder">
                    {token.isPositive ? (
                      <svg viewBox="0 0 40 20" className="chart-positive">
                        <path d="M0,15 Q10,10 20,8 T40,5" stroke="#10b981" strokeWidth="2" fill="none"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 40 20" className="chart-negative">
                        <path d="M0,5 Q10,8 20,12 T40,15" stroke="#ef4444" strokeWidth="2" fill="none"/>
                      </svg>
                    )}
                  </div>
                </div>

                <div className={`token-change ${token.isPositive ? 'positive' : 'negative'}`}>
                  <div className="change-percent">{token.change}</div>
                  <div className="change-detail">{token.changePercent}</div>
                </div>

                <div className="token-market-cap">
                  <div className="market-cap-value">{token.marketCap}</div>
                  <div className="market-cap-label">M.Cap</div>
                </div>

                <div className="token-earnings">
                  <div className="earnings-value">{token.lifetimeEarnings}</div>
                  <div className="earnings-label">Lifetime</div>
                </div>

                <div className="token-yield">
                  <div className="yield-value">{token.yield}%</div>
                  <div className="yield-label">Yield</div>
                </div>

                <div className="token-action">
                  <button className="trade-btn">Trade</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="swap-right-panel">
          <div className="swap-widget">
            <div className="swap-widget-header">
              <h3 className="widget-title">Swap</h3>
              <div className="currency-display">$ • USD</div>
            </div>

            <div className="swap-toggle">
              <button 
                className={`toggle-btn ${isSwapping === 'Buy' ? 'active' : ''}`}
                onClick={() => setIsSwapping('Buy')}
              >
                Buy
              </button>
              <button 
                className={`toggle-btn ${isSwapping === 'Sell' ? 'active' : ''}`}
                onClick={() => setIsSwapping('Sell')}
              >
                Sell
              </button>
            </div>

            <div className="swap-inputs">
              <div className="input-section">
                <div className="input-header">
                  <span className="input-label">Pay</span>
                  <span className="input-balance">Balance 1234.36</span>
                </div>
                <div className="input-container">
                  <input
                    type="text"
                    className="amount-input"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                  />
                  <div className="currency-selector">USDC</div>
                </div>
              </div>

              <div className="swap-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19,12 12,19 5,12"></polyline>
                </svg>
              </div>

              <div className="input-section">
                <div className="input-header">
                  <span className="input-label">Receive</span>
                  <span className="input-balance">Balance</span>
                </div>
                <div className="input-container">
                  <span className="receive-amount">≈ {receiveAmount}</span>
                  <div className="currency-selector">ERP-00</div>
                </div>
              </div>
            </div>

            <div className="trade-details">
              <div className="detail-row">
                <span>Price 1 EXP-001 -</span>
                <span>2.45 USDC</span>
              </div>
              <div className="detail-row">
                <span>Slippage: 6.5%</span>
                <span>Price-Impact</span>
              </div>
              <div className="detail-row">
                <span>Fees</span>
                <span>LP 0.35% - Protocol 0.65%</span>
              </div>
            </div>

            <button className="swap-execute-btn">Swap</button>
            
            <div className="approve-section">
              <span className="approve-text">Approve EXP-001</span>
            </div>

            <div className="holdings-section">
              <div className="holdings-header">
                <span>You hold:</span>
                <span className="holdings-amount">1,120.44 EXP-</span>
              </div>
              <div className="holdings-detail">
                <span>Est. share of earnings</span>
                <span>3.2</span>
              </div>
            </div>

            <div className="disclaimer">
              <p>
                Tokens represent revenue rights fo<br />
                contributor content. Availability may be<br />
                region-restricted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
