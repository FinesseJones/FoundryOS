"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

// Simulates global setting change
const useGlobalCurrency = () => {
    const [currency, setCurrency] = useState<Currency>('USD');

    // In a real application, this state change would dispatch a global context update
    const changeCurrency = (newCurrency: Currency) => {
        setCurrency(newCurrency);
        console.log(`[GLOBAL STATE] Currency changed to ${newCurrency}. All components should re-render with new conversion rates.`);
        // Here, we would trigger a system event signaling all components to re-calculate financials.
    };

    return { currency, changeCurrency };
}

const CurrencySwitcher: React.FC = () => {
    const { currency, changeCurrency } = useGlobalCurrency();

    return (
        <Card className="p-6 border-l-4 border-green-600 shadow-md bg-green-50/50">
            <CardHeader>
                <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6 text-green-600"/>
                    <CardTitle className="text-lg">Base Currency Control</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-600">Select the base currency for all financial reporting, invoicing, and budgeting across the platform.</p>
                    <div className="flex space-x-4">
                        <Select 
                            value={currency} 
                            onValueChange={(v) => changeCurrency(v as any)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                                <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default CurrencySwitcher;