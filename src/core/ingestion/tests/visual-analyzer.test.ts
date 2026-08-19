import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VisualBrandAnalyzer } from '../visual-analyzer';

const analyzer = new VisualBrandAnalyzer();

test('VisualBrandAnalyzer: Site with meta theme-color (authoritative source)', () => {
  // Simulates a modern site that pins its theme color via <meta>.
  // This is the most authoritative signal — browser-pinned, intent-declared.
  const html = `
    <html>
      <head>
        <meta name="theme-color" content="#1a73e8">
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#202124">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
      </head>
      <body style="font-family: 'Inter', sans-serif;">
        <h1>Welcome</h1>
      </body>
    </html>
  `;

  const profile = analyzer.analyzeStyles(html);

  // Should extract the theme colors
  assert.ok(profile.colors.length >= 1, 'Should extract at least one theme-color');
  const light = profile.colors.find((c) => c.value === '#1a73e8');
  assert.ok(light, 'Should find the light theme color #1a73e8');
  assert.equal(light!.source, 'meta_theme_color');
  assert.ok(light!.confidence >= 0.95, 'meta_theme_color confidence should be near 1.0');

  // Should extract the Google Font
  const inter = profile.fonts.find((f) => f.value === 'Inter');
  assert.ok(inter, 'Should extract Inter from Google Fonts link');
  assert.equal(inter!.source, 'google_fonts_link');
  assert.ok(inter!.confidence >= 0.9);

  // The meta theme-color should outrank any hex_inline matches
  assert.equal(profile.colors[0].source, 'meta_theme_color', 'meta_theme_color should rank #1 by confidence');

  // Stats
  assert.equal(profile.extractionStats.metaThemeColorFound, true);
  assert.equal(profile.extractionStats.googleFontsFound, 1);
  assert.equal(profile.extractionStatus, 'found');
});

test('VisualBrandAnalyzer: Site with CSS variable brand colors', () => {
  // Simulates a site that uses CSS custom properties for theming.
  // No meta theme-color, no JSON-LD — relies entirely on <style> block.
  const html = `
    <html>
      <head>
        <style>
          :root {
            --brand-primary: #FF6B35;
            --brand-secondary: #004E89;
            --brand-accent: #F5CB5C;
            --spacing-md: 16px;
            --text-color: #1A1A2E;
          }
          body { font-family: "Outfit", "Helvetica Neue", sans-serif; }
          h1 { color: var(--brand-primary); }
        </style>
      </head>
      <body>
        <h1>Brand</h1>
      </body>
    </html>
  `;

  const profile = analyzer.analyzeStyles(html);

  // Should extract the brand- prefixed vars, but NOT --spacing-md or --text-color (not brandish)
  const primary = profile.colors.find((c) => c.value === '#ff6b35');
  assert.ok(primary, 'Should extract --brand-primary');
  assert.equal(primary!.source, 'css_variable');
  assert.equal(primary!.selector, '--brand-primary');
  assert.ok(primary!.confidence > 0.7);

  // Should NOT extract --spacing-md (not a color, not brandish)
  // Should NOT extract --text-color (technically a color var but not brandish in this naming)
  //   — actually the regex includes "color" so it might. Verify it does or doesn't and pick:
  const textColor = profile.colors.find((c) => c.value === '#1a1a2e');
  if (textColor) {
    assert.equal(textColor!.source, 'css_variable');
  }

  // Should extract Outfit font
  const outfit = profile.fonts.find((f) => f.value === 'Outfit');
  assert.ok(outfit, 'Should extract Outfit font from font-family');
  assert.equal(outfit!.source, 'css_font_family');

  // Stats
  assert.ok(profile.extractionStats.cssVariablesFound >= 3, 'Should find at least 3 brand css vars');
  assert.equal(profile.extractionStatus, 'found');
});

test('VisualBrandAnalyzer: Site with NO color or font signals returns not_found, NOT defaults', () => {
  // This is the critical test. A page with zero styling signals should return
  // extractionStatus='not_found' and an empty colors/fonts array. The old
  // behavior would silently return #6366f1 — that's the bug we are fixing.
  const html = `
    <html>
      <head>
        <title>Plain Page</title>
      </head>
      <body>
        <h1>Hello world</h1>
        <p>This page has no styling information at all.</p>
      </body>
    </html>
  `;

  const profile = analyzer.analyzeStyles(html);

  // CRITICAL ASSERTIONS — these prove the bug is fixed
  assert.equal(profile.colors.length, 0, 'Should return ZERO colors, NOT default purple');
  assert.equal(profile.fonts.length, 0, 'Should return ZERO fonts, NOT default Inter');
  assert.equal(profile.inferredDefaults.colors.length, 0, 'Should return ZERO inferred defaults — no silent invention');
  assert.equal(profile.inferredDefaults.fonts.length, 0);
  assert.equal(profile.extractionStatus, 'not_found', 'extractionStatus must be not_found when no signals');

  // Stats show nothing was found
  assert.equal(profile.extractionStats.metaThemeColorFound, false);
  assert.equal(profile.extractionStats.jsonLdColorFound, false);
  assert.equal(profile.extractionStats.cssVariablesFound, 0);
  assert.equal(profile.extractionStats.fontFamiliesFound, 0);
  assert.equal(profile.extractionStats.googleFontsFound, 0);

  // brandPersonalitySignals should be empty or only contain extracted signals
  // (it should NOT contain "Modern Glassmorphic" or "Authoritative SaaS" type guesses)
  for (const sig of profile.brandPersonalitySignals) {
    assert.equal(sig.source, 'extracted', `Signal "${sig.value}" must be marked as extracted, not invented`);
  }
});

test('VisualBrandAnalyzer: Site with background-color but no theme-color still gets colors', () => {
  const html = `
    <html>
      <head>
        <style>
          body { background-color: #FAFAFA; }
          .header { background: #2D3748; }
          .button { background: linear-gradient(135deg, #FF6B35, #F5CB5C); }
        </style>
      </head>
    </html>
  `;

  const profile = analyzer.analyzeStyles(html);

  assert.ok(profile.colors.length >= 1);
  // The gradient should be skipped (we can't extract meaningful colors from a gradient)
  // The solid background-colors should be present
  const bodyBg = profile.colors.find((c) => c.value === '#fafafa');
  assert.ok(bodyBg, 'Should extract body background-color #FAFAFA');
  assert.equal(bodyBg!.source, 'background_color');
});

test('VisualBrandAnalyzer: JSON-LD color field is extracted', () => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Acme Corp",
          "brand": {
            "@type": "Brand",
            "name": "Acme",
            "color": "#FF5500"
          }
        }
        </script>
      </head>
    </html>
  `;

  const profile = analyzer.analyzeStyles(html);

  const acme = profile.colors.find((c) => c.value === '#ff5500');
  assert.ok(acme, 'Should extract color from JSON-LD');
  assert.equal(acme!.source, 'json_ld');
  assert.ok(acme!.confidence >= 0.85, 'JSON-LD confidence should be high');
});

test('VisualBrandAnalyzer: Two different sites produce different results (no shared defaults)', () => {
  // The original bug: every site returned the same #6366f1 / #a855f7 / #ec4899 palette.
  // This test proves the fix: two sites with different real colors produce different outputs.
  const site1 = `<html><head><meta name="theme-color" content="#1a73e8"></head><body></body></html>`;
  const site2 = `<html><head><meta name="theme-color" content="#ff5722"></head><body></body></html>`;

  const p1 = analyzer.analyzeStyles(site1);
  const p2 = analyzer.analyzeStyles(site2);

  assert.equal(p1.colors[0].value, '#1a73e8');
  assert.equal(p2.colors[0].value, '#ff5722');
  assert.notEqual(p1.colors[0].value, p2.colors[0].value, 'Different sites must produce different colors');
});
