"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/status-badge";
import { useToast } from "@/components/ui/use-toast";

// Updated UserProfile interface
interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Editor' | 'Viewer' | 'Guest';
    status: 'Active' | 'Suspended' | 'Pending';
}

const initialMockUsers: UserProfile[] = [
    { id: 'u1', name: 'Jane Smith', email: 'jane.smith@brand.com', role: 'Admin', status: 'Active' },
    { id: 'u2', name: 'Mark Olsen', email: 'mark.olsen@brand.com', role: 'Editor', status: 'Suspended' },
    { id: 'u3', name: 'Sarah Lee', email: 'sarah.lee@brand.com', role: 'Viewer', status: 'Active' },
    { id: 'u4', name: 'Alex Kim', email: 'alex.kim@brand.com', role: 'Guest', status: 'Active' },
];

// Role Mapping for display
const roleClasses: Record<UserProfile['role'], { text: string; color: string }> = {
    'Admin': { text: 'Administrator', color: 'bg-red-100 text-red-700' },
    'Editor': { text: 'Editor', color: 'bg-yellow-100 text-yellow-700' },
    'Viewer': { text: 'Viewer', color: 'bg-green-100 text-green-700' },
    'Guest': { text: 'Guest', color: 'bg-gray-100 text-gray-500' },
};

// --- User Profile Dialog Component ---
const UserProfileDialog: React.FC<{ user: UserProfile; isOpen: boolean; onClose: () => void }> = ({ user, isOpen, onClose }) => {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
          title: "User Profile Saved",
          description: `Permissions for ${user.name} have been updated.`,
        });
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
                <div className="space-y-4 pt-4">
                    <p>Details and permissions form would go here.</p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- Invite User Dialog Component ---
const InviteUserDialog: React.FC<{ onInvite: (email: string, role: UserProfile['role']) => void; isOpen: boolean; onClose: () => void }> = ({ onInvite, isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserProfile['role']>('Viewer');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({ title: "Email is required", variant: "destructive" });
            return;
        }
        onInvite(email, role);
        setEmail('');
        setRole('Viewer');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite New User</DialogTitle>
                    <DialogDescription>
                        Enter the email address and assign a role. An invitation will be sent.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="invite-role">Role</Label>
                        <Select onValueChange={(value) => setRole(value as UserProfile['role'])} value={role}>
                            <SelectTrigger id="invite-role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Editor">Editor</SelectItem>
                                <SelectItem value="Viewer">Viewer</SelectItem>
                                <SelectItem value="Guest">Guest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Send Invitation</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// Trigger Component for Details
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
  const [users, setUsers] = useState<UserProfile[]>(initialMockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleInviteUser = (email: string, role: UserProfile['role']) => {
    const newUser: UserProfile = {
      id: `u${users.length + 1}`,
      name: `(Pending) ${email.split('@')[0]}`,
      email: email,
      role: role,
      status: 'Pending',
    };
    setUsers(prev => [...prev, newUser]);
    setIsInviteDialogOpen(false);
    toast({
      title: "Invitation Sent!",
      description: `An invitation has been sent to ${email}.`,
    });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">User & Team Management</h1>
      <p className="text-gray-600">View, manage roles, and control permissions for every team member.</p>
      
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
        <Button onClick={() => setIsInviteDialogOpen(true)}>
            + Invite User
        </Button>
      </div>
      
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
                            <TableCell>
                                <StatusBadge status={user.role} variant="secondary">
                                    {roleClasses[user.role]?.text || 'N/A'}
                                </StatusBadge>
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={user.status}>
                                    {user.status}
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
      <InviteUserDialog
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          onInvite={handleInviteUser}
      />
    </div>
  );
};

export default Users;