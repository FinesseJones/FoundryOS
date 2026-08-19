export interface CleanedDocument {
  sourceUrl: string;
  title: string;
  cleanMarkdown: string;
  cleanText: string;
  extractedHeadings: { level: number; text: string }[];
  wordCount: number;
  cleanedAt: string;
}

export class ContentCleaner {
  cleanHtml(url: string, rawHtml: string, title: string = ''): CleanedDocument {
    // 1. Remove script, style, nav, footer, and SVG boilerplate tags
    let textContent = rawHtml
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    // 2. Extract headings
    const headingMatches = Array.from(textContent.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi));
    const extractedHeadings = headingMatches.map((m) => ({
      level: parseInt(m[1], 10),
      text: m[2].replace(/<[^>]+>/g, '').trim(),
    }));

    // 3. Convert HTML headings & paragraphs to Markdown
    let markdown = textContent
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = markdown.split(/\s+/).filter(Boolean);

    return {
      sourceUrl: url,
      title: title || 'Cleaned Document',
      cleanMarkdown: markdown,
      cleanText: words.join(' '),
      extractedHeadings,
      wordCount: words.length,
      cleanedAt: new Date().toISOString(),
    };
  }
}
