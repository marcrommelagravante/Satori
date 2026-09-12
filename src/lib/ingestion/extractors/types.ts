export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocument {
  fullText: string;
  pages: ExtractedPage[];
  metadata?: Record<string, unknown>;
}
