import { BuyerPersona } from '../knowledge';

export class PersonaGeneratorEngine {
  generatePersonas(companyName: string, targetAudience: string, industry?: string, textContent?: string): BuyerPersona[] {
    const text = (textContent || targetAudience || '').toLowerCase();
    const ind = (industry || '').toLowerCase();

    if (ind.includes('hvac') || text.includes('hvac') || text.includes('heating') || text.includes('air conditioning')) {
      return [
        {
          id: 'persona_hvac_01',
          name: 'Residential Homeowner',
          role: 'Homeowner & Property Owner',
          demographics: 'Homeowners aged 30-65 needing climate control maintenance & emergency repairs',
          psychographics: 'Seeks fast turnaround, transparent pricing, and energy-efficient HVAC upgrades.',
          goals: ['Ensure 24/7 home comfort', 'Lower monthly electricity & gas bills', 'Prevent sudden AC breakdown'],
          challenges: ['High summer cooling bills', 'Unexpected HVAC breakdown in extreme weather'],
          buyingTriggers: ['Seasonal HVAC maintenance alert', 'Air conditioning unit failure'],
          preferredChannels: ['Google Local Search', 'Direct Phone Call', 'Community Reviews'],
        },
        {
          id: 'persona_hvac_02',
          name: 'Commercial Facility Director',
          role: 'Property & Operations Manager',
          demographics: 'Commercial building managers overseeing multi-tenant office or retail facilities',
          psychographics: 'Demands strict SLA uptime, commercial HVAC compliance, and enterprise servicing contracts.',
          goals: ['Maintain building HVAC compliance', 'Minimize downtime for commercial tenants'],
          challenges: ['High building energy footprint', 'Managing multi-unit heating systems'],
          buyingTriggers: ['Tenant climate complaints', 'Annual HVAC audit'],
          preferredChannels: ['Direct Sales Inquiry', 'Enterprise Procurement', 'Vendor Portals'],
        },
      ];
    }

    if (ind.includes('restaurant') || text.includes('food') || text.includes('salad') || text.includes('dining') || text.includes('menu')) {
      return [
        {
          id: 'persona_rest_01',
          name: 'Health-Conscious Everyday Diner',
          role: 'Active Professional / Health Enthusiast',
          demographics: 'Urban professionals aged 22-45 seeking clean, nutritious dining options',
          psychographics: 'Prioritizes organic ingredients, transparent nutritional info, and fast digital ordering.',
          goals: ['Eat fresh, nutrient-rich meals daily', 'Order online quickly for pickup or delivery'],
          challenges: ['Unhealthy fast-food options near work', 'Limited diet customization options'],
          buyingTriggers: ['Lunch break meal decision', 'Post-workout hunger'],
          preferredChannels: ['Mobile App', 'Instagram / TikTok', 'In-Store Kiosk'],
        },
        {
          id: 'persona_rest_02',
          name: 'Corporate Catering Coordinator',
          role: 'Office Manager & Event Host',
          demographics: 'Administrative leads organizing group lunches and company events',
          psychographics: 'Requires reliable bulk ordering, punctual delivery, and allergy-friendly menu choices.',
          goals: ['Provide healthy team lunch options', 'Ensure 100% on-time corporate delivery'],
          challenges: ['Accommodating diverse dietary restrictions', 'Late delivery ruining office schedule'],
          buyingTriggers: ['Weekly team lunch order', 'Company milestone celebration'],
          preferredChannels: ['Catering Web Portal', 'Direct Account Manager', 'Corporate Email'],
        },
      ];
    }

    if (ind.includes('devops') || ind.includes('cloud') || text.includes('observability') || text.includes('monitoring') || text.includes('kpi')) {
      return [
        {
          id: 'persona_devops_01',
          name: 'DevOps Lead & Site Reliability Engineer',
          role: 'SRE Lead / Infrastructure Specialist',
          demographics: 'Engineers aged 28-48 managing distributed cloud clusters and telemetry pipelines',
          psychographics: 'Obsessed with uptime, low MTTR, metric correlation, and alert noise reduction.',
          goals: ['Maintain 99.99% cloud service uptime', 'Correlate logs, metrics, and APM traces instantly'],
          challenges: ['Alert fatigue during outages', 'Debugging complex microservice dependencies'],
          buyingTriggers: ['Major cloud outage incident', 'Telemetry migration to unified platform'],
          preferredChannels: ['Slack/Teams Communities', 'Developer Documentation', 'GitHub'],
        },
        {
          id: 'persona_devops_02',
          name: 'VP of Infrastructure & Security',
          role: 'VP Engineering / CTO',
          demographics: 'Engineering executives overseeing multi-cloud budget and security posture',
          psychographics: 'Focuses on cloud cost optimization, SOC2 compliance, and enterprise scalability.',
          goals: ['Consolidate monitoring tools to cut cost', 'Ensure continuous cloud security compliance'],
          challenges: ['Uncontrolled cloud data ingestion costs', 'Vendor sprawl across observability tools'],
          buyingTriggers: ['Annual IT budget review', 'Cloud compliance security audit'],
          preferredChannels: ['Gartner Reports', 'Peer CTO Networks', 'Executive Briefings'],
        },
      ];
    }

    return [
      {
        id: 'persona_gen_01',
        name: `${companyName} Key Decision Maker`,
        role: 'Primary Buyer / Account Executive',
        demographics: `Decision makers evaluating ${companyName} solutions`,
        psychographics: `Focused on ROI, operational efficiency, and rapid implementation of ${companyName}.`,
        goals: [`Maximize ROI with ${companyName}`, 'Streamline core team workflows'],
        challenges: ['Legacy process friction', 'Resource constraints'],
        buyingTriggers: ['Strategic initiative kickoff', 'Annual budget approval'],
        preferredChannels: ['Company Website', 'Direct Demo Request', 'Industry Webinars'],
      },
    ];
  }
}
