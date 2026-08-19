import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IndustryClassifier } from '../industry-classifier';

const classifier = new IndustryClassifier();

test('IndustryClassifier: HVAC site is correctly classified (not software_technology)', () => {
  // Simulates a real HVAC company page. Note that the keywords are buried in
  // body copy, not just in h1/h2. The old inlined classifier used title+meta+h1+h2
  // only and missed all of these.
  const hvacHtml = `
    <html>
      <head>
        <title>Cool Air Solutions — Your Local HVAC Experts</title>
        <meta name="description" content="Family-owned heating and cooling company serving the metro area for 30 years.">
        <h1>Trusted HVAC Services</h1>
      </head>
      <body>
        <h2>Heating Repair</h2>
        <p>Our certified HVAC technicians provide 24/7 emergency heating repair, furnace replacement, heat pump installation, and climate control system upgrades. We service all major brands of air conditioning equipment and offer energy efficiency audits on every visit.</p>
        <h2>Air Conditioning</h2>
        <p>Stay cool all summer with our professional air conditioning service. From ductwork inspection to thermostat upgrades, our HVAC team handles residential and light commercial cooling jobs.</p>
        <h2>Why Choose Us</h2>
        <p>Licensed and insured HVAC contractor with a 100% satisfaction guarantee. Same-day cooling service available in most areas.</p>
      </body>
    </html>
  `;

  const result = classifier.classify({
    bodyText: hvacHtml.replace(/<[^>]+>/g, ' '),
    headings: 'Cool Air Solutions — Your Local HVAC Experts. Trusted HVAC Services. Heating Repair. Air Conditioning.',
    metaKeywords: ['hvac', 'heating', 'cooling', 'ac repair', 'furnace'],
    jsonLdTypes: ['HVACBusiness'],
  });

  assert.equal(result.industry, 'hvac_building_services', `Expected hvac_building_services, got ${result.industry}. Evidence: ${result.evidenceTerms.join(', ')}`);
  assert.ok(result.confidence >= 0.6, `Expected confidence >= 0.6, got ${result.confidence}`);
  assert.equal(result.source, 'json_ld', `Expected source json_ld (HVACBusiness pinned it), got ${result.source}`);
});

test('IndustryClassifier: Restaurant site is correctly classified from body copy', () => {
  // Keywords are in body copy only — simulates the original failure mode where
  // the old inlined classifier only saw title+meta+h1+h2 and missed body content.
  const restaurantHtml = `
    <html>
      <head>
        <title>Green Bowl — Fresh Salads & Bowls</title>
        <meta name="description" content="Fast casual farm-to-table dining in downtown.">
      </head>
      <body>
        <h1>Eat Well, Live Well</h1>
        <p>Green Bowl is a fast casual restaurant serving chef-crafted salads, grain bowls, and fresh-sourced organic meals. Our menu changes seasonally to feature the freshest local produce available.</p>
        <h2>Our Menu</h2>
        <p>Choose from over 20 signature salads, warm bowls, and cold-pressed beverages. We offer catering for corporate lunch and dinner events. Reservations recommended for weekend brunch.</p>
        <h2>About the Kitchen</h2>
        <p>Our chef sources ingredients daily from local farms. Sustainable farming practices are at the heart of our kitchen philosophy. We are committed to community wellness through fresh, nutrient-dense dining.</p>
      </body>
    </html>
  `;

  const result = classifier.classify({
    bodyText: restaurantHtml.replace(/<[^>]+>/g, ' '),
    headings: 'Green Bowl — Fresh Salads & Bowls. Eat Well, Live Well. Our Menu. About the Kitchen.',
    metaKeywords: ['restaurant', 'salad', 'catering'],
    jsonLdTypes: ['Restaurant'],
  });

  assert.equal(result.industry, 'restaurant_food_services', `Expected restaurant_food_services, got ${result.industry}. Evidence: ${result.evidenceTerms.join(', ')}`);
  assert.ok(result.confidence >= 0.6, `Expected confidence >= 0.6, got ${result.confidence}`);
});

test('IndustryClassifier: DevOps/Observability site is correctly classified', () => {
  const devopsHtml = `
    <html>
      <head>
        <title>HyperObserve — AI-Powered Observability Platform</title>
        <meta name="description" content="Unified monitoring for cloud-native infrastructure.">
      </head>
      <body>
        <h1>See Everything. Fix Anything.</h1>
        <p>HyperObserve is an AI-powered observability and monitoring platform for modern DevOps teams. Built for SREs and platform engineers managing cloud native infrastructure at scale.</p>
        <h2>Metrics, Logs, and Traces</h2>
        <p>Collect telemetry from Kubernetes, serverless workloads, and distributed tracing pipelines. Get instant root cause analysis with our built-in APM and incident response workflows.</p>
        <h2>Why Teams Switch</h2>
        <p>Drop in our agent in under 10 minutes. Predictable pricing, no log ingestion surprises, and full support for OpenTelemetry. Trusted by DevOps teams running mission-critical infrastructure monitoring at scale.</p>
      </body>
    </html>
  `;

  const result = classifier.classify({
    bodyText: devopsHtml.replace(/<[^>]+>/g, ' '),
    headings: 'HyperObserve — AI-Powered Observability Platform. See Everything. Fix Anything. Metrics, Logs, and Traces.',
    metaKeywords: ['observability', 'monitoring', 'apm', 'devops', 'cloud native'],
    jsonLdTypes: ['SoftwareApplication'],
  });

  assert.equal(result.industry, 'devops_cloud_observability', `Expected devops_cloud_observability, got ${result.industry}. Evidence: ${result.evidenceTerms.join(', ')}`);
  assert.ok(result.confidence >= 0.7, `Expected confidence >= 0.7, got ${result.confidence}`);
});

test('IndustryClassifier: Returns alternative candidates for ambiguous cases', () => {
  // Site that mentions "platform" + "automation" — easy to misclassify as software_technology.
  // The classifier should return the real industry as #1, but list alternative candidates
  // so downstream consumers can disambiguate with more context.
  const ambiguous = `
    <html>
      <body>
        <h1>BrightCare Dental</h1>
        <p>Our dental practice provides comprehensive patient care including preventive dentistry, cosmetic dental treatments, and orthodontic services. Our team of dentists and dental hygienists are committed to clinical excellence and patient comfort.</p>
        <p>Schedule an appointment today. We accept most major health insurance plans and offer pediatric dentistry services for the whole family. New patients welcome — book a consultation online.</p>
      </body>
    </html>
  `;

  const result = classifier.classify({
    bodyText: ambiguous.replace(/<[^>]+>/g, ' '),
    headings: 'BrightCare Dental',
    metaKeywords: ['dental', 'dentist', 'patient care'],
    jsonLdTypes: ['Dentist'],
  });

  // Dental/medical is now healthcare_medical in our taxonomy
  assert.equal(result.industry, 'healthcare_medical', `Expected healthcare_medical, got ${result.industry}. Evidence: ${result.evidenceTerms.join(', ')}`);
  assert.ok(result.alternativeCandidates.length > 0, 'Should return alternative candidates for context');
});

test('IndustryClassifier: Generic SaaS site falls back to software_technology with low confidence', () => {
  const generic = `
    <html>
      <body>
        <h1>CloudFlow Pro</h1>
        <p>The modern platform for managing your business workflows. Sign up for a free trial today.</p>
      </body>
    </html>
  `;

  const result = classifier.classify({
    bodyText: generic.replace(/<[^>]+>/g, ' '),
    headings: 'CloudFlow Pro',
    metaKeywords: [],
    jsonLdTypes: [],
  });

  assert.equal(result.industry, 'software_technology');
  assert.equal(result.source, 'fallback');
  assert.ok(result.confidence <= 0.6, `Generic fallback should have low confidence, got ${result.confidence}`);
});
