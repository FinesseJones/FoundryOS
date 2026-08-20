"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { UserRole } from "@/types/user"; // Assuming this types file exists

// Component for displaying a role toggle filter (Helper component remains)
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


// Define API-friendly types for the rendered data
interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    status: boolean;
}

// To make the component functional without mock data, I will apply a placeholder prop
interface UsersProps {
    initialUsers: User[]; // Expects users from parent component/API Provider
}

const Users: React.FC<UsersProps> = ({ initialUsers }) => {
    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<Partial<Record<UserRole, boolean>>>({});
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState<boolean>(true); // True for Active, False for Inactive

    // Mock list of roles (Used for internal logic)
    const allRoles: UserRole[] = ["ADMIN", "ADMIN_PRO", "SUPPORT", "BASIC"];


    // API Data Fetching Simulation (This is where the actual call MUST go)
    // We use the passed initialUsers as a substitute for the API response.
    const users = initialUsers || []; 

    // Filter Logic Hook (Improved to process the received data)
    const filteredUsers = React.useMemo(() => {
        return users.filter(user => {
            // 1. Search Term Filter
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            // 2. Role Filter
            const matchesRole = Object.keys(filterRole).every(role => {
                const actualRole = role as UserRole;
                const isChecked = filterRole[actualRole] || false;
                return isChecked ? (user.role === actualRole) : true;
            });

            // 3. Department Filter
            const matchesDept = filterDepartment === '' || user.department === filterDepartment;

            // 4. Status Filter
            const matchesStatus = filterStatus === true ? user.status : !user.status;

            return matchesSearch && matchesRole && matchesDept && matchesStatus;
        });
    }, [searchTerm, filterRole, filterDepartment, filterStatus, users]);


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
                <p className="text-gray-600">View, manage, and audit all user accounts in the system. (Data source should be API).</p>

                {/* Filtering and Search Card */}
                <Card className="p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Filter Criteria</h2>
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

                        {/* Roles Filter */}
                        <RoleFilter />
                    </div>
                </Card>


                {/* User Table */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-xl">
                            <Bell className="w-5 h-5 text-indigo-600"/>
                            <span >Found {filteredUsers.length} Users</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr className="uppercase text-xs text-gray-500 tracking-wider">
                                        <th className="px-6 py-3 text-left">Name</th>
                                        <th className="px-6 py-3 text-left">Email</th>
                                        <th className="px-6 py-3 text-left">Role</th>
                                        <th className="px-6 py-3 text-left">Department</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-500">
                                                <Info className="w-8 h-8 mx-auto mb-2"/>
                                                <p>No users found matching your current filter criteria.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div >
        </AppLayout>
    );
}

/* Example usage wrapper for calling component (usually parent page/App.tsx)
// In production, the parent component would call API and pass data:
const MyPageWrapper = () => {
    // const userData = useApiFetch('/users'); // <-- This is where the data goes
    // return <Users initialUsers={userData} />
    return <Users initialUsers={[]} />; // Empty array placeholder for now
}
*/

export default Users;