import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Info, PlusCircle, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { logSystemEvent } from "@/utils/auditLogger"; // <-- Imported logger

export type UserRole = 'ADMIN' | 'ADMIN_PRO' | 'SUPPORT' | 'BASIC';

// Define API-friendly types for the rendered data
export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    status: boolean;
}

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
            const target = e.target;
            const name = target.name;
            const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
            setFormState(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            
            const submissionData = {
                ...formState,
                id: editingUser?.id || 0
            } as Omit<User, 'id'>; 

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
                                checked={Boolean(formState.status)}
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
            </div>
        );
    };


    return (
        <AppLayout>
            <div className="space-y-6 font-sans text-slate-100">
                {/* Header with Organization Context */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white font-serif">Enterprise User Directory & Staff Roster</h1>
                                <p className="text-xs text-slate-400 font-mono">
                                    Environment Masters, Inc. (Jackson, MS) • Active RBAC Seats & Dispatch Roles
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Button 
                            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Add Team Member</span>
                        </Button>
                    </div>
                </div>

                {/* Search and Filter Toolbar */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Search Bar (5 cols) */}
                        <div className="md:col-span-5 relative">
                            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Search Staff</label>
                            <Input
                                type="text"
                                placeholder="Search by name, email, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl focus:border-indigo-400"
                            />
                        </div>

                        {/* Department Dropdown (3 cols) */}
                        <div className="md:col-span-3">
                            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Department</label>
                            <select 
                                value={filterDepartment} 
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                            >
                                <option value="">All Departments (HVAC, Plumbing, Electrical)</option>
                                <option value="Executive">Executive & Ownership</option>
                                <option value="Operations">Operations & Dispatch</option>
                                <option value="Commercial Electrical">Commercial Electrical</option>
                                <option value="Commercial Accounts">Commercial Accounts & Sales</option>
                                <option value="Support">Field Support & Apprentices</option>
                            </select>
                        </div>

                        {/* Status Toggle (2 cols) */}
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Status</label>
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setFilterStatus(true)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition ${filterStatus === true ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
                                >
                                    Active
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterStatus(false)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition ${filterStatus === false ? 'bg-red-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>

                        {/* Role Pills (2 cols) */}
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">RBAC Role</label>
                            <span className="text-[11px] font-mono text-indigo-300 font-bold px-2.5 py-1.5 rounded-lg bg-indigo-950 border border-indigo-500/40 inline-block w-full text-center">
                                Total: {filteredUsers.length} Staff
                            </span>
                        </div>
                    </div>
                </div>

                {/* Spacious, High-Contrast User Table */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-white">
                            <Bell className="w-4 h-4 text-indigo-400"/>
                            <span>Verified Team Members ({filteredUsers.length})</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                            Logged in as: <strong className="text-indigo-300">{currentUser.role}</strong>
                        </span>
                    </div>

                    <div className="overflow-x-auto"> 
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-950">
                                <tr className="uppercase text-[10px] font-mono text-slate-400 tracking-wider">
                                    <th className="px-6 py-3.5 text-left">Staff Member</th>
                                    <th className="px-6 py-3.5 text-left">Email Address</th>
                                    <th className="px-6 py-3.5 text-left">Department</th>
                                    <th className="px-6 py-3.5 text-left">RBAC Role</th>
                                    <th className="px-6 py-3.5 text-left">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-xs">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-800/40 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{user.name}</p>
                                                        <p className="text-[10px] font-mono text-slate-400">ID: #EM-{1000 + user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-300">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
                                                    {user.department || 'Operations'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge className="bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/40">
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                                                    user.status 
                                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                                                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                                    {user.status ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-xs">
                                                <button 
                                                    onClick={() => { setEditingUser(user); setIsModalOpen(true);}} 
                                                    className="text-indigo-400 hover:text-indigo-300 font-bold mr-4 transition"
                                                >
                                                    Edit
                                                </button>
                                                {(canDelete) && (
                                                    <button 
                                                        onClick={() => { handleDeleteUser(user.id);}}
                                                        className="text-rose-400 hover:text-rose-300 font-bold transition"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-slate-400 font-mono">
                                            <Info className="w-8 h-8 mx-auto mb-2 text-indigo-400"/>
                                            <p className="text-white font-bold">No team members match the search filters.</p>
                                            <p className="text-xs text-slate-500 mt-1">Try resetting the department or status filter above.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Conditional Modal for User Creation/Editing */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full text-slate-100 p-2">
                            <UserFormModal />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Users;