import React from 'react';
import { BusinessDNA } from '../../core/knowledge';
import { BusinessReportView } from '../BusinessReportView';

interface DNAProfileViewProps {
  dna: BusinessDNA;
}

export const DNAProfileView: React.FC<DNAProfileViewProps> = ({ dna }) => {
  return <BusinessReportView dna={dna} setActiveTab={() => {}} />;
};
