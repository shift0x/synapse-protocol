import React from 'react';
import App from './app/App';
import ReactDOM from 'react-dom/client';
import HomePage from './app/pages/HomePage';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import './index.css';

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { WagmiProvider } from 'wagmi';
import { config } from './app/lib/chain';


const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />
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
