import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './index.css';

function DetailsPage() {
  const { number } = useParams();

  return (
    <div>
      <h1>Details Page</h1>
      <p>Unique Number: {number}</p>
    </div>
  );
}

const manifestUrl = 
  "https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById('root')).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/details/:number" element={<DetailsPage />} />
      </Routes>
    </Router>
  </TonConnectUIProvider>
);
