"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800">Application Settings</h1>
      <p className="text-gray-600 mb-6">Manage global application configurations, user roles, and integrations.</p>

      <Card>
        <CardHeader>
          <CardTitle>General Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
                <label htmlFor="site-name" className="font-medium">Site Name</label>
                <input id="site-name" type="text" defaultValue="Brand First Corp" className="border p-1 rounded w-2/3"/>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
                <label htmlFor="timezone" className="font-medium">Timezone</label>
                <select id="timezone" className="border p-1 rounded w-2/3">
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                </select>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-gray-600">Connect external tools like CRM or Analytics platforms here.</p>
            <Button variant="secondary">Connect Google Analytics</Button>
            <Button variant="secondary">Connect Salesforce</Button>
        </CardContent>
      </Card>

      <div className="pt-8">
        <Button className="w-full bg-red-600 hover:bg-red-700">
            Save Changes & Log Out
        </Button>
      </div>
    </div>
  );
};

export default Settings;