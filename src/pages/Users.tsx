"use client";

import AppLayout from "@/components/AppLayout";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Pencil, Loader, Eye, Trash2, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; 

// DEFINE USER ROLES
type UserRole = 'SuperAdmin' | 'Manager' | 'Client' | 'Basic';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
}

const mockUsers: User[] = [
    { id: 'u1', name: 'Alice Johnson', email: 'alice@corp.com', role: 'SuperAdmin', isActive: true },
    { id: 'u2', name: 'Bob Developer', email: 'bob@corp.com', role: 'Manager', isActive: true },
    { id: 'u3', name: 'Charlie Client', email: 'charlie@client.com', role: 'Client', isActive: true },
    { id: 'u4', name: 'David Worker', email: 'david@corp.com', role: 'Basic', isActive: false },
];

// Simulate the global user context (this would come from the backend/auth service)
const currentUserRole: UserRole = 'SuperAdmin'; 

const UsersContent: React.FC = () => {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // 1. Filtering Logic
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Permission Guard (The core of RBAC)
    const canEdit = (user: User) => currentUserRole === 'SuperAdmin' || currentUserRole === 'Manager';
    const canDelete = (user: User) => currentUserRole === 'SuperAdmin';
    const canManageRole = (user: User) => currentUserRole === 'SuperAdmin';

    // 3. Handlers (Simulating API Calls)
    const handleUserAction = (action: 'edit' | 'delete' | 'role', user: User) => {
        if (action === 'edit' && !canEdit(user)) {
            toast.error("Permission Denied", { description: "You do not have permission to edit this user's details." });
            return;
        }
        if (action === 'delete' && !canDelete(user)) {
            toast.error("Permission Denied", { description: "You do not have permission to delete users." });
            return;
        }
        if (action === 'role' && !canManageRole(user)) {
             toast.error("Permission Denied", { description: "You do not have permission to change roles." });
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
            {/* Header and Search */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                        <Users className="w-6 h-6 text-indigo-600"/>
                        <span>Manage Team Members</span>
                    </h2>
                    <p className="text-muted-foreground mt-1">View, edit, and assign roles to all users accessing the platform.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <Input 
                        placeholder="Search by name or email..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full sm:w-64"
                    />
                    <Button>+ Invite New User</Button>
                </div>
            </div>

            {/* User Table */}
            <Card className="p-0 overflow-hidden">
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                                    </div>
                                                    <div className=''>
                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={user.role === 'SuperAdmin' ? "default" : "secondary"}>{user.role}</Badge>
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
                                                    disabled={!canManageRole(user)}
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
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            No users found matching "{searchTerm}".
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