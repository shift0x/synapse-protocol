import React, { useState } from 'react';
import './KnowledgePage.css';

const KnowledgePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Earnings');

  // Sample knowledge topics data
  const knowledgeTopics = [
    {
      id: 1,
      category: 'DevOps',
      title: 'On-call incident triage playbooks',
      totalPaid: 8661.40,
      contributors: 32,
      updated: 'Apr 29, 305'
    },
    {
      id: 2,
      category: 'Sales',
      title: 'Enterprise discovery call hauristics',
      totalPaid: 3214.13,
      contributors: 18,
      updated: 'Apr 202.5'
    },
    {
      id: 3,
      category: 'Support',
      title: 'Escalation rules-of-thumb for Tier-2 Allestributors',
      totalPaid: 2134.00,
      contributors: 11,
      updated: 'Apr 22, 305'
    },
    {
      id: 4,
      category: 'Security',
      title: 'Phishing triage & containment checklist',
      totalPaid: 2502.80,
      contributors: 7,
      updated: null
    },
    {
      id: 5,
      category: 'Data Eng',
      title: 'Rellable Airflow deploy & rollback',
      totalPaid: 1324.55,
      contributors: 22,
      updated: 'May 01, 2028'
    },
    {
      id: 6,
      category: 'Product',
      title: 'Prioritization anti-patterns in roadmap planning',
      totalPaid: 1143.12,
      contributors: 7,
      updated: 3
    }
  ];

  const categories = ['All', 'DevOps', 'Sales', 'Support', 'Security', 'Data Eng', 'Product'];
  const sortOptions = ['Earnings', 'Contributors', 'Updated', 'Alphabetical'];

  const filteredTopics = knowledgeTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    switch (sortBy) {
      case 'Earnings':
        return b.totalPaid - a.totalPaid;
      case 'Contributors':
        return (b.contributors || 0) - (a.contributors || 0);
      case 'Alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    
    <div className="knowledge-page">
      <div className="page-header">
        <div className="page-content">
          <div className="section-header-left">
            <h2 className="section-header">
              <span>Share your field wisdom.</span>
              <span>Earn when it's used.</span>
            </h2>
          </div>
          <p className="page-subtitle mt-2">
            Search topics to contribute your expertise in interview style questionnaires. Get paid when agents use your knowledge.
          </p>
        </div>
        
        <div className="earnings-section dashboard-stat-card primary">
          <div className="earnings-header">
            <div className="earnings-title">LIFETIME EARNINGS</div>
          </div>
          
          <div className="earnings-main">
            <div className="earnings-amount">$2,847.32</div>
          </div>
        </div>
      </div>

      <div className="knowledge-search-section">
          <div className="search-row">
            <div className="search-input-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search topics, roles, or keywords..."
                className="knowledge-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="category-filter">
                <label className="filter-label">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <svg className="select-arrow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>

              <div className="sort-filter">
                <label className="filter-label">Sort by</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <svg className="select-arrow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="category-pills">
            {categories.slice(1).map(category => (
              <button
                key={category}
                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
            <button className="category-pill more">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>

      <div className="knowledge-content">
        <div className="knowledge-grid">
          {sortedTopics.map((topic) => (
            <div key={topic.id} className="knowledge-card">
              <div className="card-header-row">
                <div className="card-category">{topic.category}</div>
                <button className="contribute-btn">
                  Contribute
                </button>
              </div>
              <h3 className="card-title">{topic.title}</h3>
              
              <div className="card-stats-row">
                <div className="stat-item">
                  <span className="stat-label">
                    Total paid
                  </span>
                  <span className="stat-value">${topic.totalPaid.toLocaleString()}</span>
                </div>
                
                <div className="stat-item">
                  {topic.contributors && (
                    <>
                      <span className="stat-label">Contributors</span>
                      <span className="contributors-value">{topic.contributors} contributors</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgePage;
