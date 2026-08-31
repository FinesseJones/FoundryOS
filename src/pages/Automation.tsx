"use client";

import AppLayout from "@/components/AppLayout";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Zap, Pencil, Clock, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

// Define the structure of a rule
interface AutomationRule {
    id: number;
    triggerDescription: string;
    actionDescription: string;
    isActive: boolean;
}

const mockRules: AutomationRule[] = [
    { 
        id: 1, 
        triggerDescription: "Missed incoming call after hours (601-353-4681)", 
        actionDescription: "Instantly dispatch 2-way SMS: 'Hi! This is Environment Masters. Sorry we missed you, how can we help with your AC/Plumbing emergency tonight?'", 
        isActive: true 
    },
    { 
        id: 2, 
        triggerDescription: "Commercial Work Order marked 'Work Completed'", 
        actionDescription: "Dispatch 1-Tap Google 5★ Review invitation via SMS + generate Text-to-Pay invoice link.", 
        isActive: true 
    },
    { 
        id: 3, 
        triggerDescription: "Jackson MS Outdoor Heat Index reaches > 95°F", 
        actionDescription: "Launch targeted SMS Broadcast to 'Priority One Maintenance' members offering complimentary capacitor & Freon checkup.", 
        isActive: true 
    }
];

const AutomationPage: React.FC = () => {
    const [rules, setRules] = useState<AutomationRule[]>(mockRules);
    const [trigger, setTrigger] = useState('');
    const [action, setAction] = useState('');

    const handleSaveRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!trigger || !action) {
            toast.warning("Missing Info", { description: "Both a trigger and an action are required to create a rule." });
            return;
        }

        // Simulate saving the rule to the database
        toast.success("Rule Activated!", { 
            description: `New automation rule saved: IF ${trigger} THEN ${action}.` 
        });

        // Optimistically add the new rule
        const newRule: AutomationRule = { 
            id: Date.now(), 
            triggerDescription: trigger, 
            actionDescription: action, 
            isActive: true 
        };
        setRules([...rules, newRule]);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Zap className="w-6 h-6 text-orange-600"/>
                <span>Automation Rules</span>
            </h1>
            <p className="text-lg text-gray-600">Define smart workflows that run automatically when specific events occur in the system.</p>

            {/* Rule Creation Form */}
            <Card className="p-6 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-3"><Pencil className="w-5 h-5 text-orange-600"/><span>Define New Rule</span></CardTitle>
                    <p className="text-sm text-muted-foreground">IF [TRIGGER] THEN [ACTION]: What happens?</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSaveRule} className="space-y-4">
                        <div>
                            <label htmlFor="trigger" className="block text-sm font-medium text-gray-700 mb-1">1. Trigger Event</label>
                            <select 
                                id="trigger" 
                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:placeholder-shown:file:file-word-break file:hover:file:file-odd file:hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                value={trigger} 
                                onChange={(e) => setTrigger(e.target.value)} 
                                required
                            >
                                <option value="">Select Trigger Event</option>
                                <option value="Project Status changes to Review">Project Status changes to Review</option>
                                <option value="New project created">New Project created</option>
                                <option value="User role is changed">User role is changed</option>
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">2. Automation Action</label>
                            <textarea 
                                id="action" 
                                rows={3} 
                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="The action the system should take (e.g., 'Send an email alert to Project Manager and create a follow-up task')."
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        
                        <div className="flex justify-between">
                            <Button type="submit" className="flex-grow">Activate Rule</Button>
                            <Button variant="outline" className="w-1/3">Clear</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Active Rules List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-3"><Target className="w-5 h-5 text-indigo-600"/><span>Active Rules Library</span></CardTitle>
                    <p className="text-sm text-muted-foreground">Review, modify, and deactivate rules.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rules.map((rule) => (
                        <div key={rule.id} className={`p-4 border rounded-lg ${rule.isActive ? 'border-green-300 bg-green-50/50 shadow-sm' : 'border-gray-200 bg-gray-50/50'} flex justify-between items-center`}>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">{rule.triggerDescription} (Trigger)</p>
                                <p className="text-sm text-gray-600 mt-1">Action: {rule.actionDescription}</p>
                            </div>
                            <div className="flex space-x-3">
                                <Badge variant={rule.isActive ? "default" : "destructive"}>{rule.isActive ? 'ACTIVE' : 'DRAFT'}</Badge>
                                <Button variant="outline" size="sm" onClick={() => toast('Rule Edited', { description: `Rule ${rule.id} was edited.` })}>Edit</Button>
                                <Button variant="outline" size="sm" onClick={() => toast('Rule Deactivated', { description: `Rule ${rule.id} was temporarily paused.` })}>Deactivate</Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default function AutomationPageWrapper() {
    return <AppLayout><AutomationPage /> </AppLayout>
}