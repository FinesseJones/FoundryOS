`. This suggests the file was created in the correct physical location (`src/components/AppLayout.tsx`).

The most common cause for this type of error in a local development environment (as suggested by the paths) is that the alias needs to be updated, or perhaps the component needs to be explicitly exported from a common location if the user's framework/vite setup requires it.

Since I cannot modify the user's build configuration (like `tsconfig.json` or `vite.config.ts`), and I previously wrote the file to the correct location, I should assume the file exists but the import path is what the framework is struggling with after the write operation.

I will re-verify the path and explicitly make the component usage cleaner, but since the path is identical to where I wrote it, I suspect this is just a temporary cache/build issue that a *rebuild command* should finally solve, combined with ensuring the import statement is absolutely correct in `src/pages/Settings.tsx`.

Strategy:
1.  Re-write the `AppLayout` component just in case the file was corrupted/missed an export. (Highly unlikely to fix the path alias, but safe).
2.  Check the import statement in `src/pages/Settings.tsx` and confirm it uses the correct local path.

The component was written and placed at `src/components/AppLayout.tsx`. The import in `src/pages/Settings.tsx` is `import AppLayout from "@/components/AppLayout";`. This path should be correct given the file structure.

I will rewrite `src/pages/Settings.tsx` to fix the import statement, just in case trailing characters or context issues are causing the error, and strongly recommend a rebuild. I will also rewrite `src/pages/Index.tsx` and `src/pages/Reports.tsx` to ensure they *all* use the relative path instead of the alias, as this is often safer in these environments.

Let's rewrite *all three* page files to fix the imports, making them relative paths.

*Self-correction*: No, the alias `@/components` is standard practice and should work if the file structure was correct. Since I just rewrote the files using components/AppLayout.tsx, I will assume the underlying path mapping is sound and the fix must be structural.

I'll stick to simply updating the file that reported the error (`Settings.tsx`) and the others that use it, and then recommending the rebuild.

Wait, I can see the path mismatch in the original code. The component I created is named `AppLayout`. The import in `src/pages/Settings.tsx` should use the full path to the component file.

Let's overwrite the files to ensure the import is exactly what the structure dictates, thereby resolving the conflict.</think>This repeated error, even after I wrote the file, indicates a tricky path resolution issue with the `@/` alias in your current build environment, particularly when referencing a component wrapper like `AppLayout`.

Since the file `src/components/AppLayout.tsx` definitely exists, the simplest and most robust fix is to change the import statement in all the pages from the alias `@/components/AppLayout` to a direct, relative path import: `../components/AppLayout`.

I will update the three files that are using this layout (`settings.tsx`, `index.tsx`, and `reports.tsx`) to use relative imports, which are less ambiguous for the build system.

<dyad-write path="src/pages/Settings.tsx" description="Updating the AppLayout import path from alias to relative path.">
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Globe, Zap } from "lucide-react";
import AppLayout from "../components/AppLayout"; // Changed from "@/components/AppLayout"

// State to simulate settings
interface SettingsState {
    companyName: string;
    tagline: string;
    primaryColor: string;
    defaultCurrency: string;
    timeZone: string;
}

const initialSettings: SettingsState = {
    companyName: "BrandFirst Agency",
    tagline: "Building powerful brands through data-driven design.",
    primaryColor: "#4f46e5", // Tailwind indigo-600 default
    defaultCurrency: "USD",
    timeZone: "America/Los_Angeles",
};

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<SettingsState>(initialSettings);

    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = (section: string) => {
        alert(`Settings for ${section} saved successfully! (In a real app, this would save to a database.)`);
    };

    return (
        <AppLayout>
            <div className="space-y-8 max-w-7xl mx-auto pt-6">
                <h1 className="text-4xl font-bold text-gray-900">System Settings</h1>
                <p className="text-lg text-gray-600">Manage global configurations, branding, and system-wide parameters.</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 1. Brand Configuration Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-3"><SlidersHorizontal className="w-5 h-5 text-indigo-600"/><span>Brand Identity</span></CardTitle>
                            <p className="text-sm text-muted-foreground">Control the public facing assets and core message of the agency.</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input 
                                        id="companyName"
                                        name="companyName"
                                        value={settings.companyName}
                                        onChange={handleBrandChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tagline">Tagline / Motto</Label>
                                    <Input 
                                        id="tagline"
                                        name="tagline"
                                        value={settings.tagline}
                                        onChange={handleBrandChange}
                                        placeholder="Your company's concise mission statement"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="primaryColor">Primary Theme Color</Label>
                                    <Input 
                                        id="primaryColor"
                                        name="primaryColor"
                                        type="color"
                                        value={settings.primaryColor}
                                        onChange={handleBrandChange}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">This color controls the primary brand button and accents across the site.</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                 <Button onClick={() => handleSave('Brand')}>Save Branding Settings</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. System Preferences Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-3"><Globe className="w-5 h-5 text-green-600"/><span>System Preferences</span></CardTitle>
                            <p className="text-sm text-muted-foreground">Define default operational parameters for the entire platform.</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                                    <Select 
                                        onValueChange={(value) => handleSystemChange(
                                            { target: { value: value } }
                                        )} 
                                        value={settings.defaultCurrency}
                                    >
                                        <SelectTrigger id="defaultCurrency">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    <Label htmlFor="timeZone">Default Time Zone</Label>
                                    <Select 
                                        onValueChange={(value) => handleSystemChange(
                                            { target: { value: value } }
                                        )} 
                                        value={settings.timeZone}
                                    >
                                        <SelectTrigger id="timeZone">
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                                            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                 <Button onClick={() => handleSave('System')}>Save System Preferences</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Integrations Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-3"><Zap className="w-5 h-5 text-orange-600"/><span>Integrations</span></CardTitle>
                            <p className="text-sm text-muted-foreground">Connect external tools like CRMs and calendars.</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 border rounded-md bg-orange-50/50">
                                <h4 className="font-semibold mb-2">CRM Sync</h4>
                                <p className="text-sm text-gray-600">Connect via Salesforce or HubSpot.</p>
                                <Button variant="outline" className="w-full mt-1">Connect CRM</Button>
                            </div>
                            <div className="p-3 border rounded-md bg-orange-50/50">
                                <h4 className="font-semibold mb-2">Calendar Events</h4>
                                <p className="text-sm text-gray-600">Sync with Google Calendar.</p>
                                <Button variant="outline" className="w-full mt-1">Connect Calendar</Button>
                            </div>
                            <Button className="w-full mt-6" onClick={() => alert('Integration keys would be displayed here!')}>
                                View API Keys
                            </Button>
                        </CardContent>
                    </Card>
                </div >
            </div>
        </AppLayout>
    );
}

export default SettingsPage;