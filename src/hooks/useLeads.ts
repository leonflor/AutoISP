import { useState, useCallback } from 'react';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subscriberCount?: string;
  currentErp?: string;
  interestedPlan?: string;
  message?: string;
  acceptTerms: boolean;
}

interface Lead extends LeadData {
  id: string;
  createdAt: string;
}

const LEADS_STORAGE_KEY = 'autoisp_leads';

export const useLeads = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLeads = useCallback((): Lead[] => {
    try {
      const stored = localStorage.getItem(LEADS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const submitLead = useCallback(async (data: LeadData): Promise<Lead> => {
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newLead: Lead = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      const leads = getLeads();
      leads.push(newLead);
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));

      return newLead;
    } finally {
      setIsSubmitting(false);
    }
  }, [getLeads]);

  return {
    submitLead,
    getLeads,
    isSubmitting,
  };
};
