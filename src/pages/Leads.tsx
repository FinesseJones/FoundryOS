"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

const mockLeads = [
    { id: 1, name: "Enterprise Corp", email: "info@enterprise.com", status: "Qualified", source: "Website", expectedRevenue: 50000 },
    { id: 2, name: "Startup XYZ", email: "ceo@start.com", status: "Needs Follow-up", source: "Referral", expectedRevenue: 15000 },
    { id: 3, name: "Retail Hub", email: "contact@retail.com", status: "Contacted", source: "Event", expectedRevenue: 0 },
    { id: 4, name: "Local Bakery", email: "bakery@local.com", status: "Cold", source: "Manual", expectedRevenue: 0 }
];


const Leads = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Lead Pipeline Management</h1>
      <p className="text-gray-600 mb-6">Monitor, qualify, and assign leads to sales agents to ensure efficient conversion.</p>
      
      <div className="flex justify-between items-center pt-1">
        <div className="flex items-center space-x-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input placeholder="Search leads by company or email..." className="border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"/>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
            + Add New Lead
        </Button>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>Potential Leads Overview</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="mb-6">
                <p class='text-sm font-medium text-gray-600 mb-2'>Lead Conversion Funnel Status</p>
                <div className="flex justify-between text-sm text-gray-600">
                    <div>Total Leads: <span className="font-bold">{mockLeads.length}</span></div>
                    <div>Qualified: <span className="font-bold text-green-600">3</span></div>
                    <div>% Conversion: 
                        <progress className="w-28 h-2 rounded-full" value="60" max="100"></progress>
                        <span className='ml-2'>{Math.round(60)}%</span>
                    </div>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Company Name</TableHead>
                        <TableHead>Contact Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Est. Value</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockLeads.map((lead) => (
                        <TableRow key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                                    lead.status === 'Needs Follow-up' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {lead.status}
                                </span>
                            </TableCell>
                            <TableCell>{lead.source}</TableCell>
                            <TableCell className="text-right font-semibold">${lead.expectedRevenue.toLocaleString()}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" className="mr-2">View</Button>
                                <Button variant="default" size="sm">Assign</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;