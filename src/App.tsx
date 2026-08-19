"use client";

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout';

// Dummy Pages components for initial structure
const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <p className="text-gray-600">Welcome to the Dashboard! Based on your business plan, we will integrate key widgets here.</p>
      {/* Dashboard content will go here */}
    </div>
  );
};

const Projects = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Projects</h1>
      <p className="text-gray-600">Manage and view all brand projects here.</p>
    </div>
  );
};

const Users = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
      <p className="text-gray-600">View, add, and edit user accounts.</p>
    </div>
  );
};

const Settings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Application Settings</h1>
      <p className="text-gray-600">Configure global application settings.</p>
    </div>
  );
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Nested Route: The Layout provides the structure */}
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Layout />}>
            <Routes>
                <Route index element={<Projects />} />
            </Routes>
          </Route>
          <Route path="users" element={<Layout />}>
            <Routes>
                <Route index element={<Users />} />
            </Routes>
          </Route>
          <Route path="settings" element={<Layout />}>
            <Routes>
                <Route index element={<Settings />} />
            </Routes>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;