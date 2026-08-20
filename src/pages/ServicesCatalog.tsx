"use client";

import React from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Zap, GitCode, ShieldCheck, DollarSign, Search } from "lucide-react";

// Define the structure for a single service
interface ServiceOffering {
    icon: React.ElementType;
    title: string;
    subheading: string;
    painsSolved: string[];
    coreDeliverables: string[];
    moduleLink: string; // Which part of the app proves this service exists
}

const ServicesCatalog: React.FC = () => {

    // Define all service offerings from our application's DNA
    const services: ServiceOffering[] = [
        {
            icon: Users,
            title: "Digital Transformation Audit (Web/UX)",
            subheading: "Modernizing dated digital assets for 2026+ search and conversion.",
            painsSolved: ["Outdated UI/UX", "Poor Mobile Performance", "Low Organic Visibility"],
            coreDeliverables: ["AI-Enhanced Experience Plan", "GEO-Targeted Strategy", "Full SEO Blueprint"],
            moduleLink: "/projects",
        },
        {
            icon: ShieldCheck,
            title: "Governance & Audit System Implementation",
            subheading: "Building iron-clad operational rule sets to ensure compliance and eliminate human error.",
            painsSolved: ["Lack of Process Traceability", "Decision-making based on memory", "Regulatory non-compliance risk"],
            coreDeliverables: ["Mandatory Workflow Gates", "Automated Audit Logging", "Cross-Module State Governance"],
            moduleLink: "/users",
        },
        {
            icon: Zap,
            title: "Strategic Client Pipeline Management (CRM)",
            subheading: "Systematically analyzing the economic viability of every potential contract.",
            painsSolved: ["Vague sales qualification", "Ignoring financial feasibility", "Lack of executive sponsorship data"],
            coreDeliverables: ["3-Pillar Opportunity Scoring", "Predictable Deal Stage Forecasting", "Built-in Financial Pain Quantifiers"],
            moduleLink: "/leads",
        },
        {
            icon: Zap,
            title: "Business Intelligence Reporting",
            subheading: "Synthesizing all operational data into predictive, executive-level reports.",
            painsSolved: ["Siloed Data", "Reactive management", "Inability to forecast resource bottlenecks"],
            coreDeliverables: ["Cross-Departmental Risk Mapping", "Resource Capacity Forecasting", "Annual Recurring Revenue (ARR) Projection Gauges"],
            moduleLink: "/analytics",
        }
    ];

    return (
        <AppLayout>
            <div className="space-y-12">
                <h1 className="text-4xl font-extrabold text-gray-900">Our Services Catalog</h1>
                <p className="text-xl text-gray-700 max-w-3xl">
                    We don't sell tools; we sell predictable, de-risked growth. Our services are built on a foundation of operational governance and strategic business intelligence.
                </p>
                <p className="text-gray-500 pt-2">
                    Use this catalog to understand how complexity is managed and how every service connects to measurable business outcomes.
                </p>

                {/* Services Grid - Applied Polishing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {services.map((service) => (
                        <Card key={service.title} className="shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border-t-4 border-indigo-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-2xl flex items-center space-x-3">
                                    <service.icon className="h-9 w-9 text-indigo-600"/>
                                    <span className="text-gray-800">{service.title}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-lg text-gray-600 border-l-4 border-yellow-300 pl-4 italic">
                                    {service.subheading}
                                </p>
                                
                                {/* Pain Points */}
                                <div className="border-b pb-4">
                                    <h4 className="text-sm font-semibold uppercase text-indigo-600 flex items-center space-x-2"><Search className="w-4 h-4"/> Pain Points Solved:</h4>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {service.painsSolved.map((pain, index) => (
                                            <Badge key={index} className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">{pain}</Badge>
                                        ))}
                                    </div >
                                </div>
                                
                                {/* Deliverables */}
                                <div>
                                    <h4 className="text-sm font-semibold uppercase text-indigo-600 flex items-center space-x-2"><ClipboardList className="w-4 h-4"/> Key Deliverables:</h4>
                                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                                        {service.coreDeliverables.map((deliverable) => (
                                            <li key={deliverable}>{deliverable}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="pt-6">
                                    <Button onClick={() => window.location.href = service.moduleLink} className="w-full bg-indigo-600 hover:bg-indigo-700 text-base py-6">
                                        View Module Logic Section →
                                    </Button>
                                </div >
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
};

export default ServicesCatalog;