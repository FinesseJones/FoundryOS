"use client";

import React, { useState } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/user"; // Assuming this types file exists

// Component for displaying a role toggle filter
const RoleFilterToggle = ({ role, isChecked, onChange }: { role: UserRole, isChecked: boolean, onChange: (r: UserRole, checked: boolean) => void }) => {
    return (
        <div className="flex items-center space-x-2">
            <input
                type="checkbox"
                id={`role-${role}`}
                checked={isChecked}
                onChange={(e) => onChange(role, e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor={`role-${role}`} className="text-sm font-medium cursor-pointer text-gray-700">
                {role.replace(/([A-Z])/g, ' $1')}: {role}
            </label>
        </div>
    );
};

const Users = () => {
    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    // FIX APPLIED HERE: Corrected the useState initialization syntax.
    const [filterRole, setFilterRole] = useState<Partial<Record<UserRole, boolean>>>({});
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState<boolean>(true); // True for Active, False for Inactive

    // Mock list of roles (Used for internal logic)
    const allRoles: UserRole[] = ["ADMIN", "ADMIN_PRO", "SUPPORT", "BASIC"];


    // Filter Logic (Unchanged, assumes correct dependencies)
    React.useEffect(() => {
        // This effect would typically run on mount or dependency change
        console.log("Filtering applied based on criteria:", { searchTerm, filterRole, filterDepartment, filterStatus });
    }, [searchTerm, filterRole, filterDepartment, filterStatus]);


    // Mock/Simulated User List
    const mockUsers = [
        { id: 1, name: "Alice Johnson", email: "alice@corp.com", role: "ADMIN", department: "Marketing", status: true },
        { id: 2, name: "Bob Smith", email: "bob@corp.com", role: "SUPPORT", department: "Support", status: true },
        { id: 3, name: "Charlie Brown", email: "charlie@corp.com", role: "BASIC", department: "Finance", status: false },
        { id: 4, name: "Diana Prince", email: "diana@corp.com", role: "ADMIN_PRO", department: "Executive", status: true },
    ];

    // --- Handlers ---
    const handleRoleToggle = (role: UserRole, checked: boolean) => {
        setFilterRole((prevRoles) => ({
            ...prevRoles,
            [role]: checked
        }));
    };

    // --- UI Components ---

    const RoleFilter = () => (
        <div className="space-y-4 pt-2">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Roles</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-2">
                {allRoles.map(role => (
                    <RoleFilterToggle 
                        key={role} 
                        role={role} 
                        isChecked={filterRole[role] || false} 
                        onChange={handleRoleToggle} 
                    />
                ))}
            </div>
        </div>
    );


    return (
        <AppLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">User Directory</h1>
                <p className="text-gray-600">View, manage, and audit all user accounts in the system.</p>

                {/* Filtering and Search Card */}
                <Card className="p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Search & Filter</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Search Bar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name or Email</label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Enter name or email"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Department Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select 
                                value={filterDepartment} 
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <option value="">All Departments</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Support">Support</option>
                                <option value="Finance">Finance</option>
                                <option value="Executive">Executive</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setFilterStatus(true)}
                                    className={`px-4 py-2 rounded-md text-sm border transition-colors ${filterStatus === true ? 'bg-green-500 border-green-600 text-white' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => setFilterStatus(false)}
                                    className={`px-4 py-2 rounded-md text-sm border transition-colors ${filterStatus === false ? 'bg-red-500 border-red-600 text-white' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>

                        {/* Roles Filter (New Component Usage) */}
                        <RoleFilter />
                        
                    </div>
                </Card>


                {/* User Table */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-xl">
                            <Bell className="w-5 h-5 text-indigo-600"/>
                            <span >Found {mockUsers.length} Users</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockUsers.map((user) => (
                                        <tr key={user.id} className={`${user.status ? 'hover:bg-green-50' : 'hover:bg-red-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">{user.role}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={user.status ? "success" : "destructive"} className="text-xs uppercase">{user.status ? "Active" : "Inactive"}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-indigo-600 hover:underline mr-3">Edit</button>
                                                <button className="text-red-600 hover:underline">Deactivate</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Users;