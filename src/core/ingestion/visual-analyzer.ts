/**
 * Visual Brand Analyzer
 *
 * Extracts brand visual signals from a page's raw HTML with explicit provenance.
 *
 * Old behavior (wrong): always returned a primary/secondary/accent color, falling
 * back to a hardcoded purple palette (#6366f1 / #a855f7 / #ec4899) for any site
 * without inline color declarations. This silently invented branding and made
 * "no colors found" indistinguishable from "colors found but defaulted."
 *
 * New behavior: every color and font is tagged with its source and confidence.
 * If nothing is extracted, the analyzer returns an empty array with
 * `extractionStatus: 'not_found'` and an empty `inferredDefaults` block. The
 * downstream consumer (UI, prompt) gets to decide what to do — not us.
 *
 * Extraction sources (in priority order):
 *   1. <meta name="theme-color">            → most authoritative, browser-pinned
 *   2. JSON-LD "color" / "logo"             → structured data
 *   3. CSS variables in inline <style>      → :root { --primary: #... }
 *   4. background-color: declarations        → inline style + <style> blocks
 *   5. Hex codes anywhere in HTML           → last resort, noisy
 *   6. SVG fill="..." attributes            → logo/icon colors
 *   7. font-family: declarations            → typography
 *   8. <link href="...?family=Inter...">    → Google Fonts
 */

export type ColorSource =
  | 'meta_theme_color'
  | 'json_ld'
  | 'css_variable'
  | 'background_color'
  | 'svg_fill'
  | 'hex_inline';

export type FontSource =
  | 'css_font_family'
  | 'google_fonts_link'
  | 'inferred_default';

export type ExtractionStatus = 'found' | 'partial' | 'not_found';

export interface ExtractedColor {
  value: string;            // normalized hex, lowercase, e.g. "#1a73e8"
  source: ColorSource;
  confidence: number;       // 0.0 - 1.0
  selector?: string;        // e.g. ":root" for CSS var, "logo" for json_ld
  evidence?: string;        // raw snippet for explainability
}

export interface ExtractedFont {
  value: string;            // e.g. "Inter, system-ui, sans-serif"
  source: FontSource;
  confidence: number;
  selector?: string;        // e.g. "body" for css_font_family
}

export interface BrandPersonalitySignal {
  value: string;
  source: 'extracted' | 'inferred';
}

export interface VisualBrandProfile {
  colors: ExtractedColor[];             // real extractions only, sorted by confidence desc
  fonts: ExtractedFont[];                // real extractions only
  brandPersonalitySignals: BrandPersonalitySignal[];
  extractionStatus: ExtractionStatus;   // 'found' if any color/font extracted, 'not_found' if neither
  /** When no signals are found, the analyzer does NOT silently invent. These are explicitly marked inferred. */
  inferredDefaults: {
    colors: ExtractedColor[];
    fonts: ExtractedFont[];
  };
  /** Stats for diagnostics / tests */
  extractionStats: {
    hexMatchesFound: number;
    metaThemeColorFound: boolean;
    jsonLdColorFound: boolean;
    cssVariablesFound: number;
    backgroundColorsFound: number;
    svgFillsFound: number;
    fontFamiliesFound: number;
    googleFontsFound: number;
  };
}

const NAMED_CSS_COLORS: Record<string, string> = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff',
  yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff', silver: '#c0c0c0', gray: '#808080',
  grey: '#808080', maroon: '#800000', olive: '#808000', purple: '#800080', teal: '#008080',
  navy: '#000080', orange: '#ffa500', pink: '#ffc0cb', brown: '#a52a2a', gold: '#ffd700',
  indigo: '#4b0082', violet: '#ee82ee', turquoise: '#40e0d0',
};

const STOPWORDS = new Set([
  'transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'none', 'auto',
]);

export class VisualBrandAnalyzer {
  analyzeStyles(rawHtml: string): VisualBrandProfile {
    const stats = {
      hexMatchesFound: 0,
      metaThemeColorFound: false,
      jsonLdColorFound: false,
      cssVariablesFound: 0,
      backgroundColorsFound: 0,
      svgFillsFound: 0,
      fontFamiliesFound: 0,
      googleFontsFound: 0,
    };

    // 1. <meta name="theme-color"> — most authoritative
    const metaThemeColor = this.extractMetaThemeColor(rawHtml);
    if (metaThemeColor.length > 0) stats.metaThemeColorFound = true;

    // 2. JSON-LD color/logo fields
    const jsonLdColors = this.extractJsonLdColors(rawHtml);
    if (jsonLdColors.length > 0) stats.jsonLdColorFound = true;

    // 3. CSS variables in <style> blocks
    const cssVarColors = this.extractCssVariableColors(rawHtml);
    stats.cssVariablesFound = cssVarColors.length;

    // 4. background-color: declarations
    const bgColors = this.extractBackgroundColors(rawHtml);
    stats.backgroundColorsFound = bgColors.length;

    // 5. Hex codes anywhere in HTML
    const hexColors = this.extractHexColors(rawHtml);
    stats.hexMatchesFound = hexColors.length;

    // 6. SVG fill="..." attributes
    const svgFills = this.extractSvgFills(rawHtml);
    stats.svgFillsFound = svgFills.length;

    // Fonts
    const fontFamilies = this.extractFontFamilies(rawHtml);
    stats.fontFamiliesFound = fontFamilies.length;
    const googleFonts = this.extractGoogleFonts(rawHtml);
    stats.googleFontsFound = googleFonts.length;

    // Build the colors array in priority order. Dedupe by value, keep highest-confidence source.
    const allColors: ExtractedColor[] = [];
    const seen = new Set<string>();

    const add = (c: ExtractedColor) => {
      const key = c.value.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      allColors.push(c);
    };

    for (const c of metaThemeColor) add(c);
    for (const c of jsonLdColors) add(c);
    for (const c of cssVarColors) add(c);
    for (const c of bgColors) add(c);
    for (const c of svgFills) add(c);
    for (const c of hexColors) add(c);

    // Sort by confidence descending
    allColors.sort((a, b) => b.confidence - a.confidence);

    // Build the fonts array — if a font is found by multiple sources, keep the highest-confidence one
    const fontByValue = new Map<string, ExtractedFont>();
    for (const f of [...fontFamilies, ...googleFonts]) {
      const key = f.value.toLowerCase();
      const existing = fontByValue.get(key);
      if (!existing || f.confidence > existing.confidence) {
        fontByValue.set(key, f);
      }
    }
    const allFonts = Array.from(fontByValue.values()).sort((a, b) => b.confidence - a.confidence);

    // Brand personality signals: extracted (e.g. "glassmorphic" from CSS) or honestly inferred.
    // Inferred signals go in brandPersonalitySignals ONLY with source='inferred'.
    const personalitySignals = this.extractPersonalitySignals(rawHtml, allColors, allFonts);

    // Decide extraction status
    const hasColors = allColors.length > 0;
    const hasFonts = allFonts.length > 0;
    let extractionStatus: ExtractionStatus;
    if (hasColors && hasFonts) extractionStatus = 'found';
    else if (hasColors || hasFonts) extractionStatus = 'partial';
    else extractionStatus = 'not_found';

    // CRITICAL: only return inferred defaults if explicitly asked. By default, the
    // analyzer reports nothing it didn't actually extract. The downstream consumer
    // can opt into a fallback by checking extractionStatus and supplying its own defaults.
    // This is the opposite of the old behavior (which always returned defaults).
    const inferredDefaults = {
      colors: [] as ExtractedColor[],
      fonts: [] as ExtractedFont[],
    };

    return {
      colors: allColors,
      fonts: allFonts,
      brandPersonalitySignals: personalitySignals,
      extractionStatus,
      inferredDefaults,
      extractionStats: stats,
    };
  }

  private extractMetaThemeColor(html: string): ExtractedColor[] {
    const out: ExtractedColor[] = [];
    const re = /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const value = this.normalizeColor(m[1]);
      if (value) {
        out.push({
          value,
          source: 'meta_theme_color',
          confidence: 0.98,
          selector: 'meta[name=theme-color]',
          evidence: m[0],
        });
      }
    }
    return out;
  }

  private extractJsonLdColors(html: string): ExtractedColor[] {
    const out: ExtractedColor[] = [];
    const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      let parsed: unknown;
      try { parsed = JSON.parse(m[1]); } catch { continue; }
      const walk = (node: unknown, path: string[]): void => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach((n, i) => walk(n, [...path, String(i)])); return; }
        const obj = node as Record<string, unknown>;
        // Organization.brand.color or .logo
        if (typeof obj['color'] === 'string') {
          const v = this.normalizeColor(obj['color']);
          if (v) {
            out.push({
              value: v,
              source: 'json_ld',
              confidence: 0.92,
              selector: path.concat('color').join('.'),
              evidence: JSON.stringify({ color: obj['color'] }),
            });
          }
        }
        // Walk children
        for (const k of Object.keys(obj)) {
          if (k === '@context' || k === '@type') continue;
          walk(obj[k], [...path, k]);
        }
      };
      walk(parsed, []);
    }
    return out;
  }

  private extractCssVariableColors(html: string): ExtractedColor[] {
    const out: ExtractedColor[] = [];
    // Match --var-name: #color or color-name inside :root or any rule
    const re = /(--[\w-]+)\s*:\s*([^;}\n]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const varName = m[1];
      const value = m[2].trim();
      const color = this.normalizeColor(value);
      if (!color) continue;
      // Only treat as a brand color if the var name hints at branding
      const isBrandish = /brand|primary|secondary|accent|main|theme|color|background/i.test(varName);
      if (!isBrandish) continue;
      out.push({
        value: color,
        source: 'css_variable',
        confidence: 0.88,
        selector: varName,
        evidence: `${varName}: ${value}`,
      });
    }
    return out;
  }

  private extractBackgroundColors(html: string): ExtractedColor[] {
    const out: ExtractedColor[] = [];
    const re = /background(?:-color)?\s*:\s*([^;}\n]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const value = m[1].trim();
      // Skip gradients and shorthand
      if (/gradient|url\(|transparent|inherit|none|initial/i.test(value)) continue;
      const color = this.normalizeColor(value);
      if (!color) continue;
      out.push({
        value: color,
        source: 'background_color',
        confidence: 0.75,
        evidence: `background: ${value}`,
      });
    }
    return out;
  }

  private extractHexColors(html: string): ExtractedColor[] {
    const out: ExtractedColor[] = [];
    const re = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const raw = m[1];
      const normalized = this.expandHex(raw);
      if (!normalized) continue;
      const key = normalized.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        value: key,
        source: 'hex_inline',
        confidence: 0.55, // lowest: hex codes are noisy
        evidence: `#${raw}`,
      });
    }
    return out;
  }

  private extractSvgFills(html: string): ExtractedColor[] {
    const out: ExtractedColor[] = [];
    const re = /\bfill=["']([^"']+)["']/g;
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const value = m[1].trim();
      if (STOPWORDS.has(value.toLowerCase())) continue;
      const color = this.normalizeColor(value);
      if (!color) continue;
      const key = color.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        value: key,
        source: 'svg_fill',
        confidence: 0.7,
        evidence: `fill="${value}"`,
      });
    }
    return out;
  }

  private extractFontFamilies(html: string): ExtractedFont[] {
    const out: ExtractedFont[] = [];
    const re = /font-family\s*:\s*([^;}\n]+)/gi;
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const raw = m[1].trim();
      // Pick the first non-generic family in the comma list
      const families = raw.split(',').map((f) => f.trim().replace(/['"]/g, ''));
      for (const family of families) {
        if (!family) continue;
        if (/^(serif|sans-serif|monospace|cursive|fantasy|system-ui)$/i.test(family)) continue;
        const key = family.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          value: family,
          source: 'css_font_family',
          confidence: 0.9,
        });
        break; // only the first non-generic per declaration
      }
    }
    return out;
  }

  private extractGoogleFonts(html: string): ExtractedFont[] {
    const out: ExtractedFont[] = [];
    const re = /<link[^>]+href=["']https:\/\/fonts\.googleapis\.com\/css2?\?([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const params = new URLSearchParams(m[1]);
      const families = params.getAll('family');
      for (const f of families) {
        const name = f.split(':')[0].replace(/\+/g, ' ').trim();
        if (!name) continue;
        out.push({
          value: name,
          source: 'google_fonts_link',
          confidence: 0.95,
          selector: 'link[href*=fonts.googleapis.com]',
        });
      }
    }
    return out;
  }

  private extractPersonalitySignals(
    _html: string,
    colors: ExtractedColor[],
    fonts: ExtractedFont[]
  ): BrandPersonalitySignal[] {
    // Extracted signals (real). Right now we extract from font names ("Inter" → "modern sans").
    // Inferred signals are NOT generated here — that's the whole point of this rewrite.
    // The downstream consumer can derive its own inferences from the extraction result.
    const out: BrandPersonalitySignal[] = [];
    for (const f of fonts.slice(0, 3)) {
      const lower = f.value.toLowerCase();
      if (/^(inter|roboto|open sans|poppins|montserrat|outfit|dm sans)/.test(lower)) {
        out.push({ value: 'modern_sans_serif', source: 'extracted' });
      } else if (/^(playfair display|merriweather|georgia|serif)/.test(lower)) {
        out.push({ value: 'editorial_serif', source: 'extracted' });
      } else if (/^(jetbrains mono|fira code|monaco|courier)/.test(lower)) {
        out.push({ value: 'technical_monospace', source: 'extracted' });
      }
    }
    if (colors.length > 0 && out.length === 0) {
      // Derive a "restrained_palette" or "vibrant_palette" signal from the saturation of extracted colors
      const saturated = colors.filter((c) => !/^#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/i.test(c.value)).length;
      if (saturated === 0) {
        out.push({ value: 'restrained_palette', source: 'extracted' });
      } else if (saturated >= 2) {
        out.push({ value: 'multi_hue_palette', source: 'extracted' });
      }
    }
    return out;
  }

  private normalizeColor(raw: string): string | null {
    if (!raw) return null;
    const trimmed = raw.trim().toLowerCase();
    if (STOPWORDS.has(trimmed)) return null;
    // Hex
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(trimmed)) {
      return this.expandHex(trimmed.slice(1));
    }
    // rgb / rgba
    const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    // Named
    if (NAMED_CSS_COLORS[trimmed]) return NAMED_CSS_COLORS[trimmed];
    return null;
  }

  private expandHex(raw: string): string | null {
    if (!/^[0-9a-fA-F]+$/.test(raw)) return null;
    if (raw.length === 3) {
      return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toLowerCase();
    }
    if (raw.length === 6) {
      return `#${raw}`.toLowerCase();
    }
    return null;
  }
}
