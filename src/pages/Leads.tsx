"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Users, Folder, TrendingUp, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { logSystemEvent } from "@/utils/auditLogger"; // <-- Imported logger
import { Search } from "lucide-react"; // Added for the modal

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    // --- CRUD HANDLERS (Updated to use logging) ---
    const handleAddLead = (formData: Omit<Lead, 'id'>) => {
        const newId = Math.max(...leads.map(l => l.id)) + 1;
        const newLead: Lead = { 
            id: newId, 
            ...formData, 
            currentStage: 'Discovery',
            status: 'Medium Priority'
        };
        setLeads([...leads, newLead]);
        // LOGGING: Log successful creation
        logSystemEvent('Leads', 'CREATE', `New lead added: ${newLead.companyName} (${newLead.primaryContact})`, currentUser.role);
        toast.success(`✅ New lead (${newLead.companyName}) added successfully!`);
        setIsModalOpen(false);
        return { success: true };
    };

    const handleEditLead = (updatedData: Partial<Lead>) => {
        if (!editingLead) return { success: false, message: "Error: No lead selected for update." };

        setLeads(leads.map(l => 
            l.id === editingLead.id ? { ...l, ...updatedData } : l
        ));
        // LOGGING: Log successful update
        logSystemEvent('Leads', 'UPDATE', `Updated lead ${editingLead.companyName} status to ${updatedData.currentStage || editingLead.currentStage}`, currentUser.role);
        toast.success(`✅ Lead ${editingLead.companyName} updated successfully!`);
        setEditingLead(null);
        setIsModalOpen(false);
        return { success: true, message: `✅ Lead ${editingLead.companyName} updated successfully!` };
    };
    
    const handleCloseLead = (leadId: number) => {
        if (!currentUser.permissions.deleteCriticalRecords && currentUser.role !== "ADMIN") {
            toast.error("🔒 Permission Denied: You must be an Admin to eliminate a lead.");
            return { success: false, message: "Permission Denied" };
        }

        setLeads(leads.filter(l => l.id !== leadId));
        // LOGGING: Log successful deactivation
        logSystemEvent('Leads', 'DELETE', `Lead ID ${leadId} removed from pipeline.`, currentUser.role);
        toast.success(`🗑️ Lead ID ${leadId} successfully archived.`);
        return { success: true, message: `🗑️ Lead ID ${leadId} successfully archived.` };
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
        
        React.useEffect(() => { setFormState({ ...initialFormData }); }, [editingLead]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            setFormState(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            let result;

            if (editingLead) {
                handleEditLead(formState);
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">1. Financial Mandate (Wallet)</label>
                            <Textarea 
                                placeholder="E.g., '$1.2M lost annually in overhead due to manual reconciliation.'"
                                value={(formState.pillarFinancialPain || '') as string} 
                                onChange={handleChange} 
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">2. Process Gap (Process)</label>
                            <Textarea 
                                placeholder="E.g., 'Requires hardware and software overhaul across 3 departments.'"
                                value={(formState.pillarProcessGap || '') as string} 
                                onChange={handleChange} 
                                required
                            />
                        </div >

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">3. Stakeholder Alignment (People)</label>
                            <Textarea 
                                placeholder="E.g., 'Finance VP (Identified Sponsor) is key to getting budget approval.'"
                                value={(formState.pillarStakeholderAlignment || '') as string} 
                                onChange={handleChange} 
                                required
                            />
                        </div >
                    </div >

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
            </div >
        </AppLayout>
    );
};

export default Leads;