"use client";

import React from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, Zap, Code2, ShieldCheck, DollarSign, Search } from "lucide-react";

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

    // Define service offerings and high-margin add-on solutions
    const services: ServiceOffering[] = [
        {
            icon: Users,
            title: "Commercial HVAC Chiller & VRF Systems",
            subheading: "Engineering high-efficiency 50 to 200-ton rooftop chillers, variable-speed VRF systems, and hospital clean-room filtration across Jackson Metro.",
            painsSolved: ["Emergency Chiller Outages in MS Humidity", "Excessive Utility Surcharges", "Poor Airflow Balance"],
            coreDeliverables: ["BACnet DDC Controller Integration", "Seasonal Coil Optimization", "24/7 Hospital & Commercial Emergency Dispatch"],
            moduleLink: "/projects",
        },
        {
            icon: ShieldCheck,
            title: "Trenchless Plumbing & NuFlow Epoxy Hydrojetting",
            subheading: "Zero-dig sewer restoration and high-pressure 4,000 PSI hydrojetting for historic and commercial Mississippi facilities.",
            painsSolved: ["Destructive Concrete Trenching", "Recurring Root Blockages", "Water Pressure Fluctuations"],
            coreDeliverables: ["Fiber-Optic HD Camera Pipe Scans", "NuFlow Structural Epoxy Lining", "Certified Commercial Backflow Prevention"],
            moduleLink: "/projects",
        },
        {
            icon: Zap,
            title: "Autonomous Social Media & Brand Voice Engine ($997/mo Retainer)",
            subheading: "Complete multi-channel social media management (LinkedIn, X, Instagram, Facebook, Google Business) with weekly brand voice posts, visual calendar, and auto-scheduler.",
            painsSolved: ["Zero Social Media Footprint", "Inconsistent Marketing Voice", "Missed Commercial Inbound Leads"],
            coreDeliverables: ["3x Weekly Branded Content Drops", "Multi-Platform Profile Setup Kit", "Automated Visual Calendar & Previews"],
            moduleLink: "/social",
        },
        {
            icon: Code2,
            title: "Fortune 500 Dynamic Web Infrastructure ($2,500 + $250/mo)",
            subheading: "Turnkey Google Presentation and online presence compiler generating responsive, high-converting Fortune 500 websites with 1-tap quote widgets.",
            painsSolved: ["Missing or Outdated Website", "High Bounce Rates", "Lack of Mobile & Text-to-Pay Integration"],
            coreDeliverables: ["Multi-Section Responsive Architecture", "Instant SMS Booking Widget", "High-Speed Global CDN & Auto SSL"],
            moduleLink: "/studio",
        },
        {
            icon: ClipboardList,
            title: "Priority One™ Commercial Maintenance Agreement",
            subheading: "The gold-standard preventative maintenance contract powering Central Mississippi enterprises since 1957.",
            painsSolved: ["Unbudgeted Equipment Failures", "Slow Response Times", "Missed Customer Inbound Calls"],
            coreDeliverables: ["Guaranteed Same-Day Dispatch", "Sub-15s Missed-Call Auto-Text", "1-Tap Text-to-Pay Invoicing"],
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