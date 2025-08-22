import React, { useState, useEffect } from 'react';
import './KnowledgePage.css';
import { getKnowledgeTopics } from '../lib/api/getKnowledgeTopics.ts';
import { formatCurrency } from '../lib/utils/currency';

const KnowledgePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Earnings');
  const [knowledgeTopics, setKnowledgeTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        const topics = await getKnowledgeTopics();
        setKnowledgeTopics(topics);
      } catch (error) {
        console.error('Failed to load knowledge topics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  const categories = ['All', ...new Set(knowledgeTopics.map(topic => topic.category))];
  const sortOptions = ['Earnings', 'Contributors', 'Alphabetical'];

  const filteredTopics = knowledgeTopics.filter(topic => {
    const matchesSearch = topic.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    switch (sortBy) {
      case 'Earnings':
        return b.total_paid - a.total_paid;
      case 'Contributors':
        return (b.contributors || 0) - (a.contributors || 0);
      case 'Alphabetical':
        return a.topic.localeCompare(b.topic);
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
            <div className="earnings-title">LIFETIME PAID</div>
          </div>
          
          <div className="earnings-main">
            <div className="earnings-amount">
              {loading ? '-' : formatCurrency(knowledgeTopics.reduce((sum, topic) => sum + topic.total_paid, 0).toString())}
            </div>
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
                  className="category-select capitalize"
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


        </div>

      <div className="knowledge-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="knowledge-grid">
            {sortedTopics.map((topic) => (
              <div key={topic.id} className="knowledge-card">
                <div className="card-header-row">
                  <div className="card-category">{topic.category}</div>
                  <button className="contribute-btn">
                    Contribute
                  </button>
                </div>
                <h3 className="card-title">{topic.subtopic.length > 75 ? `${topic.subtopic.substring(0, 75)}...` : topic.subtopic}</h3>
                
                <div className="card-stats-row">
                  <div className="stat-item">
                    <span className="stat-label">
                      Total paid
                    </span>
                    <span className="stat-value">{formatCurrency(topic.total_paid.toFixed(2).toString())}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Contributors</span>
                    <span className="contributors-value">{topic.contributors} contributors</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgePage;
