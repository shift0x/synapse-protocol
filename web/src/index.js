import '@rainbow-me/rainbowkit/styles.css';

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
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import './index.css';

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { WagmiProvider } from 'wagmi';
import { config } from './app/lib/chain/chain.ts';
import AppLayout from './app/pages/AppLayout';
import UserStateProvider from './app/providers/UserStateProvider';
import { ToastProvider } from './app/providers/ToastProvider';


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
        <RainbowKitProvider theme={darkTheme()}>
          <UserStateProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </UserStateProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
