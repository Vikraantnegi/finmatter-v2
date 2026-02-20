/**
 * Statement domain model.
 * Represents an uploaded statement file and its extraction lifecycle (statement_files).
 */

export type StatementStatus =
  | "UPLOADED"
  | "EXTRACTED"
  | "PARSED"
  | "FAILED";

export type StatementExtractionMethod = "pdfjs" | "pdf-parse";

export type Statement = {
  id: string;
  userId: string;
  filePath: string;
  fileHash: string;
  status: StatementStatus;
  extractedText?: string;
  pageCount?: number;
  extractionMethod?: StatementExtractionMethod;
  createdAt: string;
  updatedAt: string;
};
