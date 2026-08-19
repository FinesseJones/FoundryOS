"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Projects = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Project Management Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Project Button */}
        <div className="lg:col-span-1">
          <Card className="p-6 shadow-lg border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold mb-3">Create New Project</h3>
            <p className="text-gray-600 mb-4">Start a new brand initiative by defining scope, goals, and team members.</p>
            <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                + New Project
            </button>
          </Card>
        </div>

        {/* Project Listing */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold">Current Projects</h3>
            {/* Example Project Card 1 */}
            <Card className="shadow-sm p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-lg font-medium">Website Redesign Q3 2024</h4>
                        <p className="text-sm text-gray-500">Scope: Full user journey optimization.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Active</span>
                        <button className="text-blue-600 hover:text-blue-800">View Details</button>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between text-sm text-gray-500">
                    <span>Due: Sep 30, 2024</span>
                    <span>Progress: 65%</span>
                </div>
            </Card>
            {/* Example Project Card 2 */}
            <Card className="shadow-sm p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-lg font-medium">Q4 Branding Assets Library</h4>
                        <p className="text-sm text-gray-500">Scope: Iconography and color palette expansion.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">On Hold</span>
                        <button className="text-blue-600 hover:text-blue-800">View Details</button>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between text-sm text-gray-500">
                    <span>Due: Nov 15, 2024</span>
                    <span>Progress: 10%</span>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Projects;