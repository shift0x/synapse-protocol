import React, { useState } from 'react';
import './DashboardPage.css';
import { NavLink } from 'react-router-dom';

const DashboardPage = () => {
  const [activeRole, setActiveRole] = useState('expert');

  // Sample data - replace with real API data
  const portfolioData = {
    totalValue: 12547.83,
    platformStats: {
      totalExperts: 1247,
      queriesProcessed: 89234,
      volumeTraded: 2387451.12
    }
  };

  const expertData = {
    lifetimeEarnings: 2847.32,
    tokenPrice: 42.67,
    priceChange24h: 5.2,
    recentQueries: 23,
    revenue24h: 158.90,
    topTopics: [
      { name: 'DevOps Incident Response', earnings: 1234.50 },
      { name: 'Enterprise Sales Tactics', earnings: 892.33 },
      { name: 'Data Pipeline Optimization', earnings: 720.49 }
    ]
  };

  const traderData = {
    holdings: [
      { expert: 'Sarah Chen', category: 'DevOps', tokens: 150, value: 6400.50, roi: 23.4 },
      { expert: 'Mike Rodriguez', category: 'Sales', tokens: 89, value: 3789.23, roi: 15.7 },
      { expert: 'Dr. Kim Park', category: 'Security', tokens: 45, value: 2358.10, roi: -3.2 }
    ],
    totalHoldings: 12547.83,
    totalPnL: 1847.62,
    yieldEarned: 234.18
  };

  const builderData = {
    creditBalance: 1234.56,
    lifetimeSpend: 482.13,
    activeAgents: 4,
    usage30d: 156,
    cost30d: 89.23,
    performanceImprovement: 34.2,
    topExperts: [
      { name: 'DevOps Expert Pool', queries: 45, cost: 67.80 },
      { name: 'Sales Strategy Pool', queries: 32, cost: 48.90 },
      { name: 'Security Analysis Pool', queries: 18, cost: 27.30 }
    ]
  };

  const recentActivity = [
    { type: 'query', description: 'AI agent queried DevOps knowledge', amount: '+$12.50', time: '2 min ago' },
    { type: 'trade', description: 'Bought 25 tokens of Sarah Chen', amount: '-$1,067.50', time: '1 hour ago' },
    { type: 'contribution', description: 'Added knowledge to Security topic', amount: null, time: '3 hours ago' },
    { type: 'earn', description: 'Earned from token holdings', amount: '+$23.40', time: '6 hours ago' },
    { type: 'deposit', description: 'Added API credits', amount: '-$500.00', time: '1 day ago' }
  ];

  const renderRoleContent = () => {
    switch (activeRole) {
      case 'expert':
        return (
          <div className="dashboard-role-content">
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card primary">
                <div className="dashboard-stat-header">
                  <span className="stat-label">Lifetime Earnings</span>
                </div>
                <div className="stat-value">${expertData.lifetimeEarnings.toLocaleString()}</div>
                <div className="dashboard-stat-change positive">+${expertData.revenue24h} (24h)</div>
                <NavLink to="/app/knowledge">
                  <button className="dashboard-stat-action">Add Knowledge</button>
                </NavLink>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-header">
                  <span className="stat-label">Token Price</span>
                </div>
                <div className="stat-value">${expertData.tokenPrice}</div>
                <div className={`dashboard-stat-change ${expertData.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                  {expertData.priceChange24h >= 0 ? '+' : ''}{expertData.priceChange24h}% (24h)
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-header">
                  <span className="stat-label">Recent Queries</span>
                </div>
                <div className="stat-value">{expertData.recentQueries}</div>
                <div className="dashboard-stat-subtitle">Last 7 days</div>
              </div>
            </div>

            <div className="dashboard-section">
              <h3 className="dashboard-section-title">Top Performing Topics</h3>
              <div className="dashboard-topics-list">
                {expertData.topTopics.map((topic, index) => (
                  <div key={index} className="dashboard-topic-item">
                    <div className="dashboard-topic-info">
                      <span className="dashboard-topic-name">{topic.name}</span>
                    </div>
                    <span className="dashboard-topic-earnings">${topic.earnings.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'trader':
        return (
          <div className="dashboard-role-content">
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card primary">
                <div className="dashboard-stat-header">
                  <span className="stat-label">Total Holdings</span>
                </div>
                <div className="stat-value">${traderData.totalHoldings.toLocaleString()}</div>
                <div className="dashboard-stat-change positive">+${traderData.totalPnL.toLocaleString()} P&L</div>
                <NavLink to="/app/swap">
                  <button className="dashboard-stat-action">Browse Market</button>
                </NavLink>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-header">
                  <span className="stat-label">Yield Earned</span>
                </div>
                <div className="stat-value">${traderData.yieldEarned}</div>
                <div className="dashboard-stat-subtitle">From holdings</div>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-header">
                  <span className="stat-label">Holdings</span>
                </div>
                <div className="stat-value">{traderData.holdings.length}</div>
                <div className="dashboard-stat-subtitle">Expert tokens</div>
              </div>
            </div>

            <div className="dashboard-section">
              <h3 className="dashboard-section-title">Portfolio Holdings</h3>
              <div className="dashboard-holdings-table">
                <div className="dashboard-table-header">
                  <span>Expert</span>
                  <span>Category</span>
                  <span>Tokens</span>
                  <span>Value</span>
                  <span>ROI</span>
                </div>
                {traderData.holdings.map((holding, index) => (
                  <div key={index} className="dashboard-table-row">
                    <span className="dashboard-expert-name">{holding.expert}</span>
                    <span className="dashboard-category">{holding.category}</span>
                    <span>{holding.tokens}</span>
                    <span>${holding.value.toLocaleString()}</span>
                    <span className={`dashboard-roi ${holding.roi >= 0 ? 'positive' : 'negative'}`}>
                      {holding.roi >= 0 ? '+' : ''}{holding.roi}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'builder':
        return (
          <div className="dashboard-role-content">
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card primary">
                <div className="dashboard-stat-header">
                  <span className="stat-label">Credit Balance</span>
                </div>
                <div className="stat-value">${builderData.creditBalance.toLocaleString()}</div>
                <div className="dashboard-stat-change">${builderData.lifetimeSpend} lifetime spend</div>
                <button className="dashboard-stat-action">Deposit Credits</button>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-header">
                  <span className="stat-label">Active Agents</span>
                </div>
                <div className="stat-value">{builderData.activeAgents}</div>
                <div className="dashboard-stat-subtitle">API keys</div>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-header">
                  <span className="stat-label">Lifetime Spend</span>
                </div>
                <div className="stat-value">${builderData.lifetimeSpend}</div>
                <div className="dashboard-stat-subtitle">Total credits used</div>
              </div>
            </div>

            <div className="dashboard-section">
              <h3 className="dashboard-section-title">Top Expert Usage</h3>
              <div className="dashboard-usage-list">
                {builderData.topExperts.map((expert, index) => (
                  <div key={index} className="dashboard-usage-item">
                    <div className="dashboard-usage-info">
                      <span className="dashboard-usage-name">{expert.name}</span>
                      <span className="dashboard-usage-queries">{expert.queries} queries</span>
                    </div>
                    <span className="dashboard-usage-cost">${expert.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-overview">
          <h2 className="dashboard-title">Dashboard</h2>
          <div className="dashboard-platform-stats">
            <div className="dashboard-platform-stat">
              <span className="dashboard-platform-label">Total Portfolio</span>
              <span className="dashboard-platform-value">${portfolioData.totalValue.toLocaleString()}</span>
            </div>
            <div className="dashboard-platform-stat">
              <span className="dashboard-platform-label">Platform Volume</span>
              <span className="dashboard-platform-value">${(portfolioData.platformStats.volumeTraded / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        <div className="dashboard-role-switcher">
          <button 
            className={`dashboard-role-btn ${activeRole === 'expert' ? 'active' : ''}`}
            onClick={() => setActiveRole('expert')}
          >
            Expert
          </button>
          <button 
            className={`dashboard-role-btn ${activeRole === 'trader' ? 'active' : ''}`}
            onClick={() => setActiveRole('trader')}
          >
            Trader
          </button>
          <button 
            className={`dashboard-role-btn ${activeRole === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveRole('builder')}
          >
            AI Builder
          </button>
        </div>
      </div>

      {renderRoleContent()}

    </div>
  );
};

export default DashboardPage;
