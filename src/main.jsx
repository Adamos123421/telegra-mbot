import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/details/:number" element={<DetailsPage />} />
    </Routes>
  </Router>
);

