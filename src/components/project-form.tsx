"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export interface ProjectData {
  id?: number;
  projectName: string;
  projectGoal: string;
  scopeDescription: string;
  priority: 'High' | 'Medium' | 'Low' | string;
  startDate: string;
  budget: string;
}

interface ProjectFormProps {
  onSubmit: (data: ProjectData) => void;
  isLoading: boolean;
  initialData?: ProjectData | null;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, isLoading, initialData, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProjectData>({
    projectName: "",
    projectGoal: "",
    scopeDescription: "",
    priority: "Medium",
    startDate: new Date().toISOString().split('T')[0],
    budget: "",
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form for creation mode
      setFormData({
        projectName: "",
        projectGoal: "",
        scopeDescription: "",
        priority: "Medium",
        startDate: new Date().toISOString().split('T')[0],
        budget: "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, priority: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.projectGoal) {
        toast({
            title: "Validation Error",
            description: "Project Name and Goal are required.",
            variant: "destructive"
        });
        return;
    }

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        onSubmit(formData);
        
        // Success feedback
        toast({
            title: "Success!",
            description: `Project "${formData.projectName}" has been successfully saved.`,
        });
        
        // Let parent component handle closing/clearing
    } catch (error) {
        // Error feedback
        toast({
            title: "Error",
            description: "Failed to create project. Please try again.",
            variant: "destructive"
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-xl shadow-md">
      {/* Project Name */}
      <div>
        <Label htmlFor="projectName">Project Name</Label>
        <Input 
          id="projectName" 
          name="projectName"
          value={formData.projectName} 
          onChange={handleChange} 
          required
        />
      </div>
      
      {/* Project Goal */}
      <div>
        <Label htmlFor="projectGoal">Primary Goal / Deliverable</Label>
        <Input 
          id="projectGoal" 
          name="projectGoal"
          value={formData.projectGoal} 
          onChange={handleChange} 
          required
          placeholder="e.g., Increase conversion rate by 15% through website redesign."
        />
      </div>

      {/* Scope Description */}
      <div>
        <Label htmlFor="scopeDescription">Scope Description (Details)</Label>
        <Textarea 
          id="scopeDescription" 
          name="scopeDescription"
          value={formData.scopeDescription} 
          onChange={handleChange}
          placeholder="Detail the activities, deliverables, and boundaries of the project."
          rows={4}
        />
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Priority */}
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select onValueChange={handleSelectChange} value={formData.priority}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Budget */}
        <div>
          <Label htmlFor="budget">Budget ($)</Label>
          <Input 
            id="budget" 
            name="budget"
            type="number"
            value={formData.budget} 
            onChange={handleChange} 
            placeholder="e.g., 50000"
          />
        </div>

        {/* Start Date */}
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input 
            id="startDate" 
            name="startDate"
            type="date"
            value={formData.startDate} 
            onChange={handleChange} 
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (initialData ? "Save Changes" : "Create Project")}
          </Button>
      </div>
    </form>
  );
};

export default ProjectForm;