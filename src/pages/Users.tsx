"use client";

import AppLayout from "@/components/AppLayout";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Pencil, Trash2, Eye, UserCheck, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { toast } from "sonner"; 

// DEFINE USER ROLES
type UserRole = 'SuperAdmin' | 'Manager' | 'Client' | 'Basic';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    department: string; // Adding department for filtering
}

const allMockUsers: User[] = [
    { id: 'u1', name: 'Alice Johnson', email: 'alice@corp.com', role: 'SuperAdmin', isActive: true, department: 'Management' },
    { id: 'u2', name: 'Bob Developer', email: 'bob@corp.com', role: 'Manager', isActive: true, department: 'Development' },
    { id: 'u3', name: 'Charlie Client', email: 'charlie@client.com', role: 'Client', isActive: true, department: 'Client Services' },
    { id: 'u4', name: 'David Worker', email: 'david@corp.com', role: 'Basic', isActive: false, department: 'Finance' },
    { id: 'u5', name: 'Eve Analyst', email: 'eve@corp.com', role: 'Basic', isActive: true, department: 'Analysis' },
    { id: 'u6', name: 'Frank Manager', email: 'frank@corp.com', role: 'Manager', isActive: true, department: 'Management' },

];

// Simulate the global user context (this would come from the backend/auth service)
const currentUserRole: UserRole = 'SuperAdmin'; 

const UsersContent: React.FC = () => {
    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<Partial<Record<UserRole, boolean>>>({}): boolean => {};
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState<boolean>(true); // True for Active, False for Inactive

    // 1. Filtering Logic using useMemo for optimization
    const filteredUsers = useMemo(() => {
        return allMockUsers.filter(user => {
            // Search term check
            if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            // Role filter check
            if (typeof filterRole === 'function' && !filterRole(user.role)) {
                return false;
            }
            // Department filter check
            if (filterDepartment && user.department !== filterDepartment) {
                return false;
            }
            // Status filter check
            if (filterStatus !== user.isActive) {
                return false;
            }
            return true;
        });
    }, [searchTerm, filterRole, filterDepartment, filterStatus]);

    // 2. Permission Guard
    const canEdit = (user: User) => currentUserRole === 'SuperAdmin' || currentUserRole === 'Manager';
    const canDelete = (user: User) => currentUserRole === 'SuperAdmin';
    const canViewRoles = (user: User) => currentUserRole === 'SuperAdmin';

    // 3. Handlers (Simulating API Calls)
    const handleUserAction = (action: 'edit' | 'delete' | 'role', user: User) => {
        if (action === 'edit' && !canEdit(user)) {
            toast.error("Permission Denied", { description: "You do not have permission to modify this user's details." });
            return;
        }
        if (action === 'delete' && !canDelete(user)) {
            toast.error("Permission Denied", { description: "You do not have permission to delete users." });
            return;
        }
        if (action === 'role' && !canViewRoles(user)) {
             toast.error("Permission Denied", { description: "You do not have permission to view or change roles." });
            return;
        }
        
        // Simulate success
        if (action === 'delete') {
            toast.success(`${user.name} deleted successfully!`, { 
                description: `This action cannot be undone and has been logged.` 
            });
        } else {
            toast.info(`${user.name} ${action} action simulated.`, { 
                description: `In a real app, this would fetch/update the database.` 
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Filtering and Search Bar */}
            <Card className="p-6 shadow-md border-l-4 border-indigo-600">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                    <div className="col-span-full sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Name/Email</label>
                        <Input 
                            placeholder="Search user name or email..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <Select 
                            value={filterDepartment} 
                            onValueChange={setFilterDepartment}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Departments</SelectItem>
                                <SelectItem value="Management">Management</SelectItem>
                                <SelectItem value="Development">Development</SelectItem>
                                <SelectItem value="Client Services">Client Services</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Analysis">Analysis</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <Select 
                            value={Object.keys(filterRole).filter(key => (filterRole as any)[key] ? true : false).join(',')} 
                            onValueChange={(v) => setFilterRole(v ? JSON.parse(`{${v.split(',')?: '}'}`) : {} as Partial<Record<UserRole, boolean>>)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Client">Client</SelectItem>
                                <SelectItem value="Basic">Basic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <Select 
                            value={filterStatus ? 'active' : 'inactive'} 
                            onValueChange={(v) => setFilterStatus(v === 'active')}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active Users</SelectItem>
                                <SelectItem value="inactive">Inactive Users</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* User Table */}
            <Card className="p-0 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr className="text-xs font-medium tracking-wider text-gray-500 uppercase bg-gray-50">
                                    <th className="px-6 py-3 text-left">🧑 User</th>
                                    <th className="px-6 py-3 text-left">📧 Email</th>
                                    <th className="px-6 py-3 text-left">🏷️ Role</th>
                                    <th className="px-6 py-3 text-left">🏢 Dept.</th>
                                    <th className="px-6 py-3 text-right">✅ Status</th>
                                    <th className="px-6 py-3 text-right">🛠️ Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className='flex items-center'>
                                                    <div className="flex-shrink-0 mr-3">
                                                        <UserCircle className="w-10 h-10 text-gray-400" />
                                                    </div >
                                                    <div className=''>
                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div >
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={user.role === 'SuperAdmin' ? "default" : "secondary"}>{user.role}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <Badge>{user.department}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Badge variant={user.isActive ? "success" : "destructive"}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleUserAction('edit', user)}
                                                    disabled={!canEdit(user)}
                                                >
                                                    <Pencil className="w-4 h-4 mr-2"/> Edit
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleUserAction('role', user)}
                                                    disabled={!canViewRoles(user)}
                                                >
                                                    <User className="w-4 h-4 mr-2"/> Roles
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    onClick={() => handleUserAction('delete', user)}
                                                    disabled={!canDelete(user)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2"/> Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function UsersPage() {
    return (
        <AppLayout>
            <UsersContent />
        </AppLayout>
    );
}