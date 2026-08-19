"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Folder, Settings, Users, Zap, DollarSign } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

interface NavItem {
  name: string;
  icon: React.FC<any>;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Projects", icon: Folder, href: "/projects" },
  { name: "Leads", icon: DollarSign, href: "/leads" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Settings", icon: Settings, href: "/settings" },
  { name: "Brand Generator", icon: Zap, href: "/brand-generator" },
];

const Sidebar = () => (
  <div className="w-64 h-full bg-gray-50 border-r p-6 flex flex-col sticky top-0 h-screen"> 
    <div className="text-2xl font-bold text-blue-700 mb-8">
      Brand First App
    </div>
    <nav className="flex-grow">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link 
              to={item.href} 
              className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;