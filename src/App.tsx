"use client";

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Users from './pages/Users';
import Settings from './pages/Settings';

// Note: I moved the content of the dummy components into src/pages/ files
// and updated the router structure to import them correctly.

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Layout component persists and wraps all nested routes */}
        <Route element={<Layout />}>
          {/* Dashboard Page (Index) */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Projects Management Page */}
          <Route path="projects" element={<Projects />} />
          
          {/* Users Management Page */}
          <Route path="users" element={<Users />} />
          
          {/* Settings Page */}
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;