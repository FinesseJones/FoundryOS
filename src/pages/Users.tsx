"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search } from 'lucide-react';

const Users = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">User & Team Management</h1>
      
      <div className="flex justify-between items-center space-y-4">
        <div className="flex items-center space-x-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input placeholder="Search by name, email, or role..." className="border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"/>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
            + Add New User
        </Button>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">Jane Smith</TableCell>
                        <TableCell>jane.smith@brand.com</TableCell>
                        <TableCell>Marketing Director</TableCell>
                        <TableCell className="text-right"><span className="text-green-600">Active</span></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Mark Olsen</TableCell>
                        <TableCell>mark.olsen@brand.com</TableCell>
                        <TableCell>Developer</TableCell>
                        <TableCell className="text-right"><span className="text-gray-500">Suspended</span></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Sarah Lee</TableCell>
                        <TableCell>sarah.lee@brand.com</TableCell>
                        <TableCell>Designer</TableCell>
                        <TableCell className="text-right"><span className="text-green-600">Active</span></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;