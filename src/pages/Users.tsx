"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Info, PlusCircle, UserPlus } from "lucide-react";
import { UserRole } from "@/types/user";
import { toast } from "react-hot-toast";
import { logSystemEvent } from "@/utils/auditLogger"; // <-- Imported logger

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

// Updated component props to receive current user state and manage internal state
interface UsersProps {
    initialUsers: User[]; 
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

const Users: React.FC<UsersProps> = ({ initialUsers, currentUser }) => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<Partial<Record<UserRole, boolean>>>({});
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // --- CRUD HANDLERS ---
    const handleCreateUser = (formData: Omit<User, 'id'>) => {
        const newId = Math.max(...users.map(u => u.id)) + 1;
        const newUser: User = { 
            id: newId, 
            ...formData, 
            status: true
        };
        setUsers([...users, newUser]);
        // LOGGING: Log successful creation
        logSystemEvent('Users', 'CREATE', `New user created: ${newUser.name} (${newUser.role})`, currentUser.role); 
        toast.success(`✅ User ${newUser.name} created successfully!`);
        setIsModalOpen(false);
    };

    const handleUpdateUser = (updatedData: Partial<User>) => {
        if (!editingUser) return { success: false, message: "Error: No user selected for update." };

        setUsers(users.map(u => 
            u.id === editingUser.id ? { ...u, ...updatedData } : u
        ));
        // LOGGING: Log successful update
        logSystemEvent('Users', 'UPDATE', `Updated user ${editingUser.name} details (Role: ${updatedData.role || editingUser.role}, Dept: ${updatedData.department || editingUser.department})`, currentUser.role); 
        toast.success(`✅ User ${editingUser.name} updated successfully!`);
        setEditingUser(null);
        setIsModalOpen(false);
        return { success: true, message: `✅ User ${editingUser.name} updated successfully!` };
    };

    const handleDeleteUser = (userId: number) => {
        if (!currentUser.permissions.deleteCriticalRecords) {
            toast.error("🔒 Permission Denied: You do not have global delete permissions.");
            return { success: false, message: "Permission Denied" };
        }

        setUsers(users.filter(u => u.id !== userId));
        // LOGGING: Log successful deletion/deactivation
        logSystemEvent('Users', 'DELETE', `User ID ${userId} deactivated by ${currentUser.role}`, currentUser.role);
        toast.error(`🗑️ User ID ${userId} successfully deactivated.`);
        return { success: true, message: `🗑️ User ID ${userId} successfully deactivated.` };
    };
    
    // Helper to determine if the current user has permission for the action
    const canManageUsers = currentUser.permissions.userManagement;
    const canDelete = currentUser.permissions.deleteCriticalRecords || currentUser.role === "ADMIN";


    // Filter Logic Hook (Unchanged, relies on state)
    const filteredUsers = useMemo(() => {
        // [Filtering logic remains the same...]
        if (users.length === 0) return [];
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = Object.keys(filterRole).every(role => {
                const actualRole = role as UserRole;
                const isChecked = filterRole[actualRole] || false;
                return isChecked ? (user.role === actualRole) : true;
            });
            const matchesDept = filterDepartment === '' || user.department === filterDepartment;
            const matchesStatus = filterStatus === true ? user.status : !user.status;
            return matchesSearch && matchesRole && matchesDept && matchesStatus;
        });
    }, [searchTerm, filterRole, filterDepartment, filterStatus, users]);


    // --- Handlers (Simplified for JSX) ---
    const handleRoleToggle = (role: UserRole, checked: boolean) => {
        setFilterRole((prevRoles) => ({
            ...prevRoles,
            [role]: checked
        }));
    };

    // UserFormModal (Unchanged functionality, just ensure prop typing is correct)
    const UserFormModal = () => {
        const initialFormData: Partial<User> = editingUser 
            ? { name: editingUser.name, email: editingUser.email, role: editingUser.role, department: editingUser.department, status: editingUser.status }
            : { role: 'BASIC', department: '', status: true };

        const [formState, setFormState] = useState<Partial<User>>({
            ...initialFormData,
            name: '', email: '', department: '', status: true
        });
        
        useEffect(() => {
            if (editingUser) {
                setFormState({ 
                    name: editingUser.name, 
                    email: editingUser.email, 
                    role: editingUser.role, 
                    department: editingUser.department, 
                    status: editingUser.status 
                });
            } else {
                setFormState({ 
                    name: '', 
                    email: '', 
                    role: 'BASIC', 
                    department: '', 
                    status: true 
                });
            }
        }, [editingUser]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type, checked } = e.target;
            setFormState(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            
            const submissionData = {
                ...formState,
                id: editingUser?.id || 0
            } as Omit<User, 'id'>; 

            let result;
            if (editingUser) {
                handleUpdateUser(submissionData);
            } else {
                handleCreateUser(submissionData);
            }
        };

        return (
            <div className="p-6 bg-white rounded-lg shadow-lg border border-indigo-200">
                <h3 className="text-xl font-semibold mb-4 text-indigo-700">
                    {editingUser ? `Edit User: ${editingUser.name}` : "Create New User"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <Input 
                                type="text" 
                                name="name" 
                                value={formState.name || ''} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <Input 
                                type="email" 
                                name="email" 
                                value={formState.email || ''} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                            <select 
                                name="role" 
                                value={(formState.role || 'BASIC') as string} 
                                onChange={handleChange} 
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="ADMIN">Administrator (ADMIN)</option>
                                <option value="ADMIN_PRO">Advanced Admin (ADMIN_PRO)</option>
                                <option value="SUPPORT">Support Staff</option>
                                <option value="BASIC">Basic User</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select 
                                name="department" 
                                value={formState.department || ''} 
                                onChange={handleChange} 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="">Select Department</option>
                                <option value="Executive">Executive</option>
                                <option value="Support">Support</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Finance">Finance</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 pt-2">
                        <div className="flex items-center">
                            <input
                                id="status"
                                type="checkbox"
                                name="status"
                                checked={!!formState.status?.(true as boolean)}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="status" className="text-sm text-gray-700">Account Active</label>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" onClick={() => { setEditingUser(null); setIsModalOpen(false);}} variant="secondary">Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            {editingUser ? "Save Changes" : "Create User"}
                        </Button>
                    </div>
                </form>
            </div >
        );
    };


    return (
        <AppLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">User Directory</h1>
                <p className="text-gray-600">View, manage, and audit all user accounts in the system.</p>

                {/* Filtering and Search Card (content remains the same) */}
                <Card className="p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Filter Criteria ({currentUser.role})</h2>
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
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
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
                                    </tr >
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* Display Logic Improvement: Show "No records found" message */}
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
                                                    <button 
                                                        onClick={() => { setEditingUser(user); setIsModalOpen(true);}} 
                                                        className="text-indigo-600 hover:underline mr-3"
                                                    >Edit</button>
                                                    {/* Implementing RBAC Guarding */}
                                                    {(canDelete) && (
                                                        <button 
                                                            onClick={() => { handleDeleteUser(user.id);}}
                                                            className="text-red-600 hover:underline"
                                                        >Deactivate</button>
                                                    )}
                                                </td>
                                            </tr >
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-500">
                                                <Info className="w-8 h-8 mx-auto mb-2 text-indigo-400"/>
                                                <p>No active users found matching the current criteria.</p>
                                                <p className="text-sm mt-1">Try adjusting your filters or clearing the search term.</p>
                                            </td >
                                        </tr >
                                </tbody>
                            </table>
                        </div >
                    </CardContent>
                </Card>
                
                {/* Conditional Modal for User Creation/Editing (Modal component requires no changes) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
                            <UserFormModal />
                        </div >
                    </div>
                )}
            </div >
        </AppLayout>
    );
};

export default Users;