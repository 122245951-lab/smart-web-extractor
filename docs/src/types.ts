/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ImageItem {
  id: string;
  url: string;
  alt: string;
  category: "photo" | "chart" | "logo" | "other";
  aiDescription?: string;
  dimensions?: string;
}

export interface TableData {
  id: string;
  headers: string[];
  rows: string[][];
  title: string;
  aiAnalysis?: string;
}

export interface MockPage {
  id: string;
  title: string;
  url: string;
  content: string;
  htmlContent: string;
  images: ImageItem[];
  tables: TableData[];
}

export interface ExtractionRule {
  id: string;
  name: string;
  description: string;
  urlPattern: string;
  enabled: boolean;
  prompt: string;
  extractionMode: "fullPage" | "selection";
  summaryLength: "short" | "medium" | "long";
  includeImages: boolean;
  includeTables: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export type TemplateType = "brief" | "structured" | "mindmap" | "custom";
export type ActiveTab = "summary" | "images" | "tables" | "edit";
export type PanelState = "hidden" | "sliding_in" | "visible" | "extracting" | "result" | "editing" | "settings";
