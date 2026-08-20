"use client";

import React from 'react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock user data for demonstration purposes
const currentUser = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  avatar: "https://via.placeholder.com/128?text=JD",
};


export default function Dashboard() {


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="department" className="text-sm font-medium">Department</label>
                <Select onValueChange={(value) => console.log(value)} defaultValue="engineering">
                  <SelectTrigger id="department" className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="role" className="text-sm font-medium">User Role</label>
                <Select onValueChange={(value) => console.log(value)} defaultValue="admin">
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="my-8">
        <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
              {/* Added Profile Card Mockup here for visual structure */}
              <div className="text-center">
                <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-100"
                />
                <p className="mt-2 text-xl font-medium">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
              {/* Mock separators structure (was line 67 originally) */}
              <div className="mt-2 md:mt-0 flex-grow">
                <Separator className='h-10' />
                <Separator />
              </div>
              <div className="text-right">
                <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {}}
                >
                    View Profile
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}