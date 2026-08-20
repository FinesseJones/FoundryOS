"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Users, Folder, TrendingUp, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { UseRole } from '@/types/user'; // Assuming this type is accessible

// Interface for a single Lead opportunity
interface Lead {
    id: number;
    companyName: string;
    primaryContact: string;
    currentStage: 'Discovery' | 'Proposal' | 'Evaluation' | 'Lost';
    status: 'High Priority' | 'Medium Priority' | 'Low Priority';
    // Custom Pillar Tracking based on our research
    pillarFinancialPain: string; // Money cost of inefficiency
    pillarProcessGap: string;  // Specific manual process choke point
    pillarStakeholderAlignment: string; // Who is the economic buyer
}

// Mock Initial Data
const MOCK_LEADS = [
    { id: 1, companyName: 'Innovate Corp', primaryContact: 'Jane Doe', currentStage: 'Evaluation', status: 'High Priority', pillarFinancialPain: '$1.2M lost annually in overhead.', pillarProcessGap: 'Manual reconciliation between departments.', pillarStakeholderAlignment: 'Finance VP (Identified Sponsor).' },
    { id: 2, companyName: 'Zenith Retail', primaryContact: 'Mark Lee', currentStage: 'Discovery', status: 'Medium Priority', pillarFinancialPain: 'Slow checkout conversion rate.', pillarProcessGap: 'Requires hardware and software overhaul.', pillarStakeholderAlignment: 'Operations Manager (Champion).' },
    { id: 3, companyName: 'Global Energy', primaryContact: 'Alex Kim', currentStage: 'Lost', status: 'Low Priority', pillarFinancialPain: 'Unknown.', pillarProcessGap: 'Unknown.', pillarStakeholderAlignment: 'None (Initial conversation only).' },
];

interface LeadsProps {
    initialLeads: Lead[];
    currentUser: { role: string; permissions: { [key: string]: boolean } };
}

const Leads: React.FC<LeadsProps> = ({ initialLeads, currentUser }) => {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    // State for modal management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    // --- CRUD HANDLERS ---
    const handleAddLead = (formData: Omit<Lead, 'id'>) => {
        const newId = Math.max(...leads.map(l => l.id)) + 1;
        const newLead: Lead = { 
            id: newId, 
            ...formData, 
            currentStage: 'Discovery', // Always start new leads at Discovery
            status: 'Medium Priority'
        };
        setLeads([...leads, newLead]);
        toast.success(`✅ New lead (${newLead.companyName}) added successfully!`);
        setIsModalOpen(false);
        return { success: true };
    };

    const handleEditLead = (updatedData: Partial<Lead>) => {
        if (!editingLead) return { success: false, message: "Error: No lead selected for update." };

        setLeads(leads.map(l => 
            l.id === editingLead.id ? { ...l, ...updatedData } : l
        ));
        toast.success(`✅ Lead ${editingLead.companyName} successfully updated!`);
        setEditingLead(null);
        setIsModalOpen(false);
        return { success: true, message: `✅ Lead ${editingLead.companyName} updated successfully!` };
    };
    
    const handleCloseLead = (leadId: number) => {
        // Role-based check for closure
        if (!currentUser.permissions.deleteCriticalRecords && currentUser.role !== "ADMIN") {
            toast.error("🔒 Permission Denied: You must be an Admin to eliminate a lead.");
            return { success: false, message: "Permission Denied" };
        }

        setLeads(leads.filter(l => l.id !== leadId));
        toast.success(`🗑️ Lead ID ${leadId} marked as closed/lost.`);
        return { success: true, message: `🗑️ Lead ID ${leadId} successfully removed from active pipeline.` };
    };


    // --- Utility Component: Lead Form Modal ---
    const LeadFormModal = () => {
        const initialFormData: Partial<Lead> = editingLead 
            ? { 
                companyName: editingLead.companyName, 
                primaryContact: editingLead.primaryContact, 
                currentStage: editingLead.currentStage, 
                status: editingLead.status,
                pillarFinancialPain: editingLead.pillarFinancialPain, 
                pillarProcessGap: editingLead.pillarProcessGap, 
                pillarStakeholderAlignment: editingLead.pillarStakeholderAlignment
            }
            : { 
                companyName: '', 
                primaryContact: '', 
                currentStage: 'Discovery', 
                status: 'Medium Priority',
                pillarFinancialPain: '',
                pillarProcessGap: '',
                pillarStakeholderAlignment: ''
            };

        const [formState, setFormState] = useState<Partial<Lead>>({
            ...initialFormData
        });
        
        // Use effect to reset form when editingLead changes (for clean state)
        React.useEffect(() => {
            setFormState({ ...initialFormData });
        }, [editingLead]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            setFormState(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            let result;

            if (editingLead) {
                result = handleEditLead(formState);
            } else {
                handleAddLead(formState);
            }
        };

        return (
            <div className="p-6 bg-white rounded-lg shadow-lg border border-indigo-200">
                <h3 className="text-xl font-semibold mb-4 text-indigo-700">
                    {editingLead ? `Edit Lead: ${editingLead.companyName}` : "Add New Potential Client Lead"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Standard Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                            <Input 
                                type="text" 
                                name="companyName" 
                                value={formState.companyName || ''} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Email</label>
                            <Input 
                                type="email" 
                                name="primaryContact" 
                                value={formState.primaryContact || ''} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                    </div>

                    {/* The Three Pillars of Evaluation */}
                    <div className="space-y-4 border-t pt-4">
                        <h4 className="text-lg font-bold text-indigo-700 flex items-center space-x-2"><Search className="w-5 h-5"/> Pillars of Opportunity</h4>
                        
                        <div className="space-y-2">
                            <Label htmlFor="pillarFinancialPain">1. Financial Mandate (The Wallet)</Label>
                            <Textarea 
                                id="pillarFinancialPain" 
                                name="pillarFinancialPain" 
                                placeholder="E.g., '$1.2M lost annually in overhead due to manual reconciliation.'"
                                value={(formState.pillarFinancialPain || '') as string} 
                                onChange={handleChange} 
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pillarProcessGap">2. Process Gap (The Process)</Label>
                            <Textarea 
                                id="pillarProcessGap" 
                                name="pillarProcessGap" 
                                placeholder="E.g., 'Requires hardware and software overhaul across 3 departments.'"
                                value={(formState.pillarProcessGap || '') as string} 
                                onChange={handleChange} 
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pillarStakeholderAlignment">3. Stakeholder Alignment (The People)</Label>
                            <Textarea 
                                id="pillarStakeholderAlignment" 
                                name="pillarStakeholderAlignment" 
                                placeholder="E.g., 'Finance VP (Identified Sponsor) is key to getting budget approval.'"
                                value={(formState.pillarStakeholderAlignment || '') as string} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                    </div>


                    {/* Action/Status */}
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stage</label>
                            <select 
                                name="currentStage" 
                                value={(formState.currentStage || 'Discovery') as string} 
                                onChange={handleChange} 
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="Discovery">Discovery</option>
                                <option value="Proposal">Proposal</option>
                                <option value="Evaluation">Evaluation</option>
                                <option value="Lost">Lost</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority Status</label>
                            <select 
                                name="status" 
                                value={(formState.status || 'Medium Priority') as string} 
                                onChange={handleChange} 
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="High Priority">High Priority</option>
                                <option value="Medium Priority">Medium Priority</option>
                                <option value="Low Priority">Low Priority</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" onClick={() => { setEditingLead(null); setIsModalOpen(false);}} variant="secondary">Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            {editingLead ? "Save Changes" : "Add Lead"}
                        </Button>
                    </div >
                </form>
            </div>
        );
    };

    // --- Table Row Actions (The Logic) ---
    const renderActionButtons = (lead: Lead) => {
        // If the lead is 'Lost', deactivation/closure button is used.
        if (lead.currentStage === 'Lost') {
            return (
                <>
                    <button 
                        onClick={() => handleCloseLead(lead.id)}
                        className="text-red-600 hover:underline"
                    >Archive</button>
                </>
            );
        }
        
        return (
            <>
                <button 
                    onClick={() => { setEditingLead(lead); setIsModalOpen(true);}} 
                    className="text-indigo-600 hover:underline mr-3"
                >Edit</button>
            </>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Client Pipeline Management</h1>
                <p className="text-gray-600">Visualizing and strategizing client opportunities based on core structural needs.</p>

                {/* Main Card */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-xl">
                            <Users className="w-5 h-5 text-green-600"/>
                            <span >Potential Leads ({leads.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-6">
                            {/* Add Lead Button */}
                            <Button onClick={() => { setEditingLead(null); setIsModalOpen(true);}} className="bg-green-600 hover:bg-green-700">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Lead
                            </Button>
                            
                            {/* Filter/Search area would go here */}
                        </div>

                        {/* Leads Table */}
                        <div className="overflow-x-auto"> 
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr className="uppercase text-xs text-gray-500 tracking-wider">
                                        <th className="px-6 py-3 text-left">Company Name</th>
                                        <th className="px-6 py-3 text-left">Contact</th>
                                        <th className="px-6 py-3 text-left">Stage</th>
                                        <th className="px-6 py-3 text-left">Priority</th>
                                        <th className="px-6 py-3 text-left">Financial Pain</th>
                                        <th className="px-6 py-3 text-left">Opportunity Pillars</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr >
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-indigo-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.companyName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lead.primaryContact}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge variant="default" className="bg-indigo-100 text-indigo-800">{lead.currentStage}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge variant={
                                                    lead.status === 'High Priority' ? 'default' : 
                                                    lead.status === 'Low Priority' ? 'secondary' : 'secondary'
                                                }>{lead.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700 font-medium">{lead.pillarFinancialPain}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-sm">
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li><strong className="text-blue-700">Process:</strong> {lead.pillarProcessGap}</li>
                                                    <li><strong className="text-yellow-700">Stakeholder:</strong> {lead.pillarStakeholderAlignment}</li>
                                                </ul>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {renderActionButtons(lead)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Conditional Modal for Lead Creation/Editing */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
                            <LeadFormModal />
                        </div >
                    </div>
                )}
            </div >
        </AppLayout>
    );
};

export default Leads;