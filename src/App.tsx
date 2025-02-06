// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { AddPage } from './components/AddPage';
import { ViewPage } from './components/ViewPage';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-page" element={<AddPage />} />
            <Route path="/view-page/:slug" element={<ViewPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const Home = () => (
  <div>
    <h1>Documentation Site</h1>
    <p>Welcome to the Documentation Site. Use the sidebar to navigate.</p>
  </div>
);

const Sidebar = () => (
  <nav className="sidebar">
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/add-page">Add a Page</Link>
      </li>
      <li>
        <Link to="/view-page/intro">View Page</Link>
      </li>
    </ul>
  </nav>
);

export default App;
