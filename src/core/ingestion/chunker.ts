import { CleanedDocument } from './cleaner';

export interface DocumentChunk {
  id: string;
  sourceUrl: string;
  sectionHeader: string;
  content: string;
  chunkIndex: number;
  tokenEstimate: number;
  wordCount: number;
}

export class SemanticChunker {
  chunkDocument(doc: CleanedDocument, maxChunkTokens: number = 250, overlapTokens: number = 30): DocumentChunk[] {
    const words = doc.cleanText.split(' ');
    const maxWords = Math.ceil(maxChunkTokens * 0.75); // ~0.75 words per token estimate
    const overlapWords = Math.ceil(overlapTokens * 0.75);

    const chunks: DocumentChunk[] = [];
    let chunkIdx = 0;
    let start = 0;

    while (start < words.length) {
      const end = Math.min(words.length, start + maxWords);
      const chunkWords = words.slice(start, end);
      const contentText = chunkWords.join(' ');

      const header = doc.extractedHeadings.length > 0
        ? doc.extractedHeadings[Math.min(chunkIdx, doc.extractedHeadings.length - 1)].text
        : 'Main Section';

      chunks.push({
        id: `chunk_${Date.now()}_${chunkIdx}`,
        sourceUrl: doc.sourceUrl,
        sectionHeader: header,
        content: contentText,
        chunkIndex: chunkIdx,
        tokenEstimate: Math.ceil(contentText.length / 4),
        wordCount: chunkWords.length,
      });

      chunkIdx++;
      start += (maxWords - overlapWords);
    }

    return chunks;
  }
}
