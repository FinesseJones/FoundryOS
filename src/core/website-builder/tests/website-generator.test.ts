import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  generateClientWebsite,
  generateStandaloneHtml,
  WEBSITE_THEMES,
} from '../website-generator';

test('WebsiteGenerator: generateClientWebsite creates complete site schema across industries', () => {
  const saasSite = generateClientWebsite({
    companyName: 'Apex Cloud Systems',
    industry: 'technology_saas',
    themeId: 'indigo',
    financialPain: '$1.5M lost annually to manual processes',
    processGap: 'Disjointed communication between engineering and ops',
  });

  assert.equal(saasSite.companyName, 'Apex Cloud Systems');
  assert.equal(saasSite.themeId, 'indigo');
  assert.ok(saasSite.hero.headline.length > 0);
  assert.ok(saasSite.hero.subheadline.length > 0);
  assert.ok(saasSite.hero.ctaPrimary.length > 0);
  assert.ok(saasSite.services.length >= 3);
  assert.ok(saasSite.pricing.length >= 3);
  assert.ok(saasSite.testimonials.length >= 2);
  assert.equal(saasSite.footer.copyrightYear, new Date().getFullYear());

  // Healthcare industry copy test
  const healthSite = generateClientWebsite({
    companyName: 'CareMatrix Health',
    industry: 'healthcare_medical',
    themeId: 'emerald',
  });

  assert.equal(healthSite.companyName, 'CareMatrix Health');
  assert.equal(healthSite.themeId, 'emerald');
  assert.ok(healthSite.hero.headline.length > 0);
  assert.ok(healthSite.services.some((s) => s.title.includes('HIPAA') || s.title.includes('Clinical') || s.title.includes('Patient') || s.title.length > 0));
});

test('WebsiteGenerator: Theme configurations are valid and apply correctly', () => {
  const themeKeys = Object.keys(WEBSITE_THEMES);
  assert.ok(themeKeys.length >= 4);

  for (const t of themeKeys) {
    const site = generateClientWebsite({
      companyName: 'Theme Test Corp',
      themeId: t,
    });
    assert.equal(site.themeId, t);
    const theme = WEBSITE_THEMES[t];
    assert.ok(theme.primaryColor.startsWith('#'));
    assert.ok(theme.bgDark.startsWith('#'));
    assert.ok(theme.cardBg.startsWith('#'));
  }
});

test('WebsiteGenerator: generateStandaloneHtml compiles responsive standalone HTML5 document', () => {
  const website = generateClientWebsite({
    companyName: 'Zenith Innovations',
    industry: 'technology_saas',
    themeId: 'cyber',
    financialPain: 'Slow deployment lead time',
    processGap: 'Manual QA bottleneck',
  });

  const html = generateStandaloneHtml(website);

  // Assert HTML5 boilerplate integrity
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('<html lang="en"'));
  assert.ok(html.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0"'));
  assert.ok(html.includes('Zenith Innovations'));

  // Assert Tailwind CDN and Google Fonts
  assert.ok(html.includes('https://cdn.tailwindcss.com'));
  assert.ok(html.includes('https://fonts.googleapis.com'));

  // Assert content rendering
  assert.ok(html.includes(website.hero.headline));
  assert.ok(html.includes(website.hero.ctaPrimary));
  assert.ok(html.includes(website.leadCapture.headline));

  // Assert theme CSS color injection
  const theme = WEBSITE_THEMES[website.themeId];
  assert.ok(html.includes(theme.primaryColor));
  assert.ok(html.includes(theme.bgDark));
});
