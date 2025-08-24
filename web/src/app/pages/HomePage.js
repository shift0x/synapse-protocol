import { NavLink } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <header className="header">
        <div className="nav-container">
          <div className="logo">
            <img src="/logo.png" className="logo-image" />
          </div>
          <NavLink to="/app/knowledge">
            <button className="launch-app-btn">Launch App</button>
          </NavLink>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">
            Turn offline human experiences<br />
            into smarter AI agents
          </h1>
          <p className="hero-subtitle">
            Todays agents are knowledgeable, but without experiences and judgement they lack the wisdom needed to be true experts. 
            Synapse solves this by giving agents access to real-world human experiences from domain experts
          </p>

          <div className="hero-image-container">
            <img src="/hero-image.jpg" alt="Synapse Protocol Flow" className="hero-image" />
          </div>

          <div className="cta-buttons">
            <NavLink to="/app/knowledge">
                <button className="btn-primary">Launch App</button>
            </NavLink>
            <NavLink to="/app/agents">
                <button className="btn-secondary">Manage Agents</button>
            </NavLink>
          </div>
        </div>

        <section className="how-it-works" id="how-it-works">
          <div className="section-container">
            <h2 className="section-header">How it works</h2>
            
            <div className="personas-grid">
              <div className="persona-card contributors">
                <div className="card-content">
                  <div className="persona-icon">
                    <div className="icon-shape">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L13.09 5.26L16 4L14.74 7.09L18 8L14.74 10.91L16 14L13.09 12.74L12 16L10.91 12.74L8 14L9.26 10.91L6 8L9.26 7.09L8 4L10.91 5.26L12 2Z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="persona-title">Contributors</h3>
                  <p className="persona-description">
                    Contribute domain knowledge by sharing your real-world experiences. Earn when your knowledge is used by agents. Mint a token that represents earnings from your shared expertise, trade it or borrow against it. Earn swap fees when others trade your knowledge token.
                  </p>
                  <div className="card-number">01</div>
                </div>
              </div>

              <div className="persona-card builders">
                <div className="card-content">
                  <div className="persona-icon">
                    <div className="icon-shape">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9Z"/>
                        <path d="M9 18H15V16H9V18ZM9 14H15V12H9V14Z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="persona-title">Agent Builders</h3>
                  <p className="persona-description">
                    Create an API key and access expert knowledge via MCP to enhance your AI agents. Pay only for what you use and get measurable performance improvements.
                  </p>
                  <div className="card-number">02</div>
                </div>
              </div>

              <div className="persona-card traders">
                <div className="card-content">
                  <div className="persona-icon">
                    <div className="icon-shape">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="persona-title">Traders</h3>
                  <p className="persona-description">
                    Find domain experts and trade their tokens in the expert marketplace. Hold short term to capture trends or hold long term to earn a share of contributor earnings.
                  </p>
                  <div className="card-number">03</div>
                </div>
              </div>

              <div className="persona-card lenders">
                <div className="card-content">
                  <div className="persona-icon">
                    <div className="icon-shape">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C13.1 2 14 2.9 14 4V8C14 9.1 13.1 10 12 10S10 9.1 10 8V4C10 2.9 10.9 2 12 2ZM19 8H17V4C17 1.8 15.2 0 13 0H11C8.8 0 7 1.8 7 4V8H5C3.9 8 3 8.9 3 10V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V10C21 8.9 20.1 8 19 8ZM12 17C13.1 17 14 16.1 14 15S13.1 13 12 13 10 13.9 10 15 10.9 17 12 17Z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="persona-title">Lenders</h3>
                  <p className="persona-description">
                    Earn yield by providing loans to contributor token holders. Get repaid through the cashflow streams generated by expertise usage.
                  </p>
                  <div className="card-number">04</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
