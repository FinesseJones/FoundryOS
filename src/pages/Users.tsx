"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, User, LogOut, ArrowDownCircle, UserCheck, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/status-badge";

// Mock User Data
interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Editor' | 'Viewer' | 'Guest';
    isSuspended: boolean;
}

const mockUsers: UserProfile[] = [
    { id: 'u1', name: 'Jane Smith', email: 'jane.smith@brand.com', role: 'Admin', isSuspended: false },
    { id: 'u2', name: 'Mark Olsen', email: 'mark.olsen@brand.com', role: 'Editor', isSuspended: true },
    { id: 'u3', name: 'Sarah Lee', email: 'sarah.lee@brand.com', role: 'Viewer', isSuspended: false },
    { id: 'u4', name: 'Alex Kim', email: 'alex.kim@brand.com', role: 'Guest', isSuspended: false },
];

// Role Mapping for display
const roleClasses: Record<typeof mockUsers[0]['role'], { text: string; color: string }> = {
    'Admin': { text: 'Administrator', color: 'bg-red-100 text-red-700' },
    'Editor': { text: 'Editor', color: 'bg-yellow-100 text-yellow-700' },
    'Viewer': { text: 'Viewer', color: 'bg-green-100 text-green-700' },
    'Guest': { text: 'Guest', color: 'bg-red-50 text-red-500' },
} as { [key: string]: { text: string; color: string } };

// --- User Profile Dialog Component ---
const UserProfileDialog: React.FC<{ user: UserProfile; isOpen: boolean; onClose: () => void }> = ({ user, isOpen, onClose }) => {
    const [newRole, setNewRoleState] = useState<typeof mockUsers[0]['role']>(user.role);
    // Initialize permissions based on current role
    const [permissions, setPermissions] = useState<{ canEditProject: boolean; canViewAnalytics: boolean; canManageUsers: boolean }>({ 
        canEditProject: user.role === 'Admin' || user.role === 'Editor', 
        canViewAnalytics: user.role === 'Viewer' || user.role === 'Admin', 
        canManageUsers: user.role === 'Admin' 
    });


    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewRoleState(e.target.value as any);
    };

    const handlePermissionChange = (key: 'canEditProject' | 'canViewAnalytics' | 'canManageUsers', checked: boolean) => {
        setPermissions(prev => ({ ...prev, [key]: checked }));
    };

    const handleSave = () => {
        alert(`User ${user.name} updated:\nRole: ${newRole}\nPermissions saved.`);
        onClose();
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <User className="w-6 h-6" />
                        <span>Manage {user.name}'s Profile</span>
                    </DialogTitle>
                    <DialogDescription>
                        Modify the user's access level, roles, and key permissions.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 pt-2">
                    {/* 1. Role Assignment */}
                    <div className="space-y-2 py-3 border rounded-md">
                        <p className="text-sm font-medium text-gray-500">Role Assignment</p>
                        <div className="flex items-center space-x-4">
                            <div className='flex-grow'>
                                <Label htmlFor="role" className='text-sm'>Select Role</Label>
                                <Select 
                                    onValueChange={handleRoleChange} 
                                    onValueRef={handleRoleChange}>
                                    <SelectTrigger id="role" value={user.role}>
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(roleClasses).map(role => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* 2. Permissions Management */}
                    <div className="space-y-4 py-3 border rounded-md">
                        <p className="text-sm font-medium text-gray-500">System Permissions</p>
                        <div className="space-y-3">
                            {[
                                { key: 'canEditProject', label: 'Edit Projects', description: 'Can modify project scope and milestones.' },
                                { key: 'canViewAnalytics', label: 'View Analytics', description: 'Access to performance metrics dashboard.' },
                                { key: 'canManageUsers', label: 'Manage Users', description: 'Ability to invite/suspend team members.' },
                            ].map(({ key, label, description }) => (
                                <div key={key} className="flex items-start space-x-3">
                                    <input 
                                        id={key} 
                                        type="checkbox" 
                                        checked={permissions[key as keyof typeof permissions]} 
                                        onChange={(e) => handlePermissionChange(key as keyof typeof permissions, e.target.checked)}
                                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 cursor-pointer"
                                    />
                                    <div className="flex-grow">
                                        <Label htmlFor={key}>{label}</Label>
                                        <p className="text-sm text-gray-500">{description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Trigger Component
const UserDetailsPanel: React.FC<{ user: UserProfile }> = ({ user }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>Details</Button>
            </DialogTrigger>
            <UserProfileDialog 
                user={user} 
                isOpen={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
            />
        </Dialog>
    );
};


const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">User & Team Management</h1>
      <p className="text-gray-600">View, manage roles, and control permissions for every team member.</p>
      
      {/* Search and Add Controls */}
      <div className="flex justify-between items-center pt-1">
        <div className="flex items-center space-x-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Input 
                placeholder="Search by name, email, or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
            />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
            + Invite User
        </Button>
      </div>
      
      {/* User Table */}
      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>Team Members ({filteredUsers.length} found)</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50 cursor-pointer">
                            <TableCell className="font-medium flex items-center space-x-3">
                                <User className="w-4 h-4 text-blue-500" />
                                <span>{user.name}</span>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="flex items-center space-x-2">
                                <StatusBadge status={user.role} variant="secondary">
                                    {roleClasses[user.role]?.text || 'N/A'}
                                </StatusBadge>
                            </TableCell>
                            <TableCell className="text-right">
                                <StatusBadge status={user.isSuspended ? 'Suspended' : 'Active'}>
                                    {user.isSuspended ? 'Suspended' : 'Active'}
                                </StatusBadge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <UserDetailsPanel user={user} />
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

export default Users;