import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

// Simple test components
function TestHome() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Home Page</h1>
      <p>This is a test to see if basic routing works.</p>
    </div>
  );
}

function TestDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Dashboard</h1>
      <p>This is a test dashboard page.</p>
    </div>
  );
}

function App() {
  console.log('App component rendering...');
  
  return (
    <Router>
      <div>
        <h1>App is loading...</h1>
        <Routes>
          <Route path="/" element={<TestHome />} />
          <Route path="/dashboard" element={<TestDashboard />} />
          <Route path="/test" element={<div><h1>Test Route Works!</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
