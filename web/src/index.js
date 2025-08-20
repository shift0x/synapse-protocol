import React from 'react';
import App from './app/App';
import ReactDOM from 'react-dom/client';
import HomePage from './app/pages/HomePage';
import AgentsPage from './app/pages/AgentsPage';
import KnowledgePage from './app/pages/KnowledgePage';
import DashboardPage from './app/pages/DashboardPage';
import BorrowLendPage from './app/pages/BorrowLendPage';

import SwapPage from './app/pages/Swap'

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import './index.css';

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { WagmiProvider } from 'wagmi';
import { config } from './app/lib/chain';
import AppLayout from './app/pages/AppLayout';


const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/app",
        element: <AppLayout />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "agents", element: <AgentsPage /> },
          { path: "knowledge", element: <KnowledgePage /> },
          { path: "swap", element: <SwapPage /> },
          { path: "borrowlend", element: <BorrowLendPage /> }
        ]
      }
    ]
  },
]);

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RouterProvider router={router} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
