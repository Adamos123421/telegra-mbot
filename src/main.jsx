

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import App from './App.jsx'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// This manifest is used temporarily for development purposes
const manifestUrl = 
  "https://raw.githubusercontent.com/Vodka2134156/STAKING-DAPP/main/public/manifest.json";
ReactDOM.createRoot(document.getElementById('root')).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
  <StrictMode>
    <App />
  </StrictMode>,
  </TonConnectUIProvider>
)


// Render the App component wrapped with TonConnectUIProvider and Router

