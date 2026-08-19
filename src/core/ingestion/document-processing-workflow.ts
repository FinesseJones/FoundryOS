import { DocumentConnectionService, DocumentRecord } from './document-connection-service';
import { ContentCleaner } from './cleaner';
import { SemanticChunker } from './chunker';
import { KnowledgeGraphBuilder } from './knowledge-graph';
import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';
import { CustomerNotificationService } from '../saas/customer-notifications';
import { BusinessDNA, createKnowledgeField } from '../knowledge';

export interface DocumentProcessingResult {
  document: DocumentRecord;
  updatedDNA: BusinessDNA;
}

export class DocumentProcessingWorkflow {
  private cleaner = new ContentCleaner();
  private chunker = new SemanticChunker();
  private graphBuilder = new KnowledgeGraphBuilder();

  constructor(
    private docService: DocumentConnectionService,
    private dnaRepo: BusinessDNARepository,
    private auditRepo: AuditRepository,
    private notificationService: CustomerNotificationService
  ) {}

  async processDocument(params: {
    organizationId: string;
    documentId: string;
    rawTextContent: string;
    actor: string;
  }): Promise<DocumentProcessingResult> {
    const doc = this.docService.getDocument({
      organizationId: params.organizationId,
      documentId: params.documentId,
    });

    if (!doc) {
      throw new Error(`Document '${params.documentId}' not found for tenant.`);
    }

    try {
      // 1. Transition Status -> PARSING
      this.docService.updateStatus(params.organizationId, params.documentId, {
        processingStatus: 'PARSING',
      });

      // 2. Parse & Clean Document via ContentCleaner
      const cleanedDoc = this.cleaner.cleanHtml(`doc://${doc.filename}`, params.rawTextContent, doc.filename);

      // 3. Transition Status -> EXTRACTING & Chunk Document
      this.docService.updateStatus(params.organizationId, params.documentId, {
        processingStatus: 'EXTRACTING',
      });

      const chunks = this.chunker.chunkDocument(cleanedDoc);

      // 4. Transition Status -> ANALYZING & Build Knowledge Graph
      this.docService.updateStatus(params.organizationId, params.documentId, {
        processingStatus: 'ANALYZING',
      });

      this.graphBuilder.buildKnowledgeGraph(doc.businessId, doc.filename);

      // 5. Extract Business Signals and Update Business DNA
      const existingDNA = await this.dnaRepo.getDNA({
        organizationId: params.organizationId,
        businessId: doc.businessId,
      });

      if (!existingDNA) {
        throw new Error(`Business DNA not found for businessId '${doc.businessId}'`);
      }

      // Extract document signals into Business DNA
      const updatedDNA: BusinessDNA = {
        ...existingDNA,
        companyIdentity: {
          ...existingDNA.companyIdentity,
          mission: createKnowledgeField(`Extracted from ${doc.filename}: ${cleanedDoc.cleanText.substring(0, 150)}`),
        },
      };

      await this.dnaRepo.saveDNA(updatedDNA, params.organizationId, params.actor);

      // 6. Transition Status -> COMPLETED
      const finalDoc = this.docService.updateStatus(params.organizationId, params.documentId, {
        processingStatus: 'COMPLETED',
        extractedSignalsCount: chunks.length,
      });

      // 7. Log Security Audit Event
      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: doc.businessId,
        action: 'update',
        changedBy: params.actor,
        details: {
          eventType: 'DOCUMENT_IMPORTED',
          filename: doc.filename,
          documentType: doc.documentType,
          chunksCount: chunks.length,
        },
      });

      // 8. Notify Customer
      this.notificationService.sendCustomerAlert({
        organizationId: params.organizationId,
        businessId: doc.businessId,
        type: 'dna_updated',
        title: 'Document Knowledge Imported',
        message: `Parsed ${doc.filename} (${doc.documentType}) and extracted ${chunks.length} knowledge signals into Business DNA.`,
      });

      return {
        document: finalDoc,
        updatedDNA,
      };
    } catch (err: any) {
      this.docService.updateStatus(params.organizationId, params.documentId, {
        processingStatus: 'FAILED',
        errorMessage: err?.message ?? 'Document processing failed',
      });
      throw err;
    }
  }
}
