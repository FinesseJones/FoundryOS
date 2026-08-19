import React from 'react';
import { BusinessDNA } from '../../core/knowledge';
import { ViewTab } from '../Navbar';
import { BusinessReportView } from '../BusinessReportView';

interface DNABeautifiedReportProps {
  dna: BusinessDNA;
  setActiveTab: (tab: ViewTab) => void;
  onReset?: () => void;
}

export const DNABeautifiedReport: React.FC<DNABeautifiedReportProps> = ({ dna, setActiveTab }) => {
  return <BusinessReportView dna={dna} setActiveTab={setActiveTab} />;
};
