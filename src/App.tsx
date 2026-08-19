"use client";

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Leads from './pages/Leads';
import Users from './pages/Users';
import Settings from './pages/Settings';
import BrandGenerator from './pages/BrandGenerator';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Dashboard Page (Index) */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Project Management Page */}
          <Route path="projects" element={<Projects />} />
          
          {/* Lead Management Page */}
          <Route path="leads" element={<Leads />} /> 
          
          {/* Users Management Page */}
          <Route path="users" element={<Users />} />
          
          {/* Brand Generator */}
          <Route path="brand-generator" element={<BrandGenerator />} />
          
          {/* Settings Page */}
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;