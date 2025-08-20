import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import './AppLayout.css';

const AppLayout = ({ balance = '1,234.56' }) => {
  return (
    <div className="page-container">
      <header className="header">
        <div className="nav-container">
          <div className="logo">
            <NavLink to="/">
              <img src="/logo.png" className="logo-image" alt="Synapse Protocol" />
            </NavLink>
          </div>
          <nav className="nav-links">
            <NavLink 
              to="/app/dashboard" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
            
            <NavLink 
              to="/app/agents" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Manage Agents
            </NavLink>

            <NavLink 
              to="/app/knowledge" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Share Knowledge
            </NavLink>
            <NavLink 
              to="/app/swap" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Swap
            </NavLink>
            <NavLink 
              to="/app/borrowlend" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Borrow / Lend
            </NavLink>
            
          </nav>
          <div className="header-balance">
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
