export type DocumentType = 'PDF' | 'DOCX' | 'TXT' | 'CSV' | 'XLSX';

export type DocumentProcessingState =
  | 'UPLOADED'
  | 'PARSING'
  | 'EXTRACTING'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED';

export interface DocumentRecord {
  id: string;
  organizationId: string;
  businessId: string;
  filename: string;
  documentType: DocumentType;
  fileSize: number;
  uploadStatus: 'SUCCESS' | 'FAILED';
  processingStatus: DocumentProcessingState;
  extractedSignalsCount: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export class DocumentConnectionService {
  private documents: Map<string, DocumentRecord> = new Map();

  /**
   * Register a new document upload for an organization.
   */
  uploadDocument(params: {
    organizationId: string;
    businessId: string;
    filename: string;
    documentType: DocumentType;
    fileSize: number;
  }): DocumentRecord {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: DocumentRecord = {
      id,
      organizationId: params.organizationId,
      businessId: params.businessId,
      filename: params.filename,
      documentType: params.documentType,
      fileSize: params.fileSize,
      uploadStatus: 'SUCCESS',
      processingStatus: 'UPLOADED',
      extractedSignalsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.set(id, record);
    return record;
  }

  /**
   * Retrieve document record verifying tenant ownership.
   */
  getDocument(query: { organizationId: string; documentId: string }): DocumentRecord | null {
    const record = this.documents.get(query.documentId);
    if (!record) return null;

    // Strict multi-tenant security verification
    if (record.organizationId !== query.organizationId) {
      return null;
    }
    return record;
  }

  /**
   * List all documents for a tenant business ID.
   */
  listDocuments(query: { organizationId: string; businessId: string }): DocumentRecord[] {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.organizationId === query.organizationId && doc.businessId === query.businessId
    );
  }

  /**
   * Update document processing status and metadata.
   */
  updateStatus(
    organizationId: string,
    documentId: string,
    updates: Partial<Omit<DocumentRecord, 'id' | 'organizationId'>>
  ): DocumentRecord {
    const record = this.getDocument({ organizationId, documentId });
    if (!record) {
      throw new Error(`Document '${documentId}' not found or tenant access denied.`);
    }

    const updated: DocumentRecord = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.documents.set(documentId, updated);
    return updated;
  }
}
