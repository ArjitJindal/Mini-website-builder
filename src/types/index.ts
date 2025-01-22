export type ThemeType = "default" | "modern" | "minimal" | "elegant";

export interface SiteContent {
  heading: string;
  paragraphs: string[];
  images: {
    url: string;
    alt: string;
    caption: string;
  }[];
  theme: ThemeType;
  lastUpdated: number;
}

export interface EditRequest {
  siteId: string;
  command: string;
  timestamp?: number;
}

export interface Log {
  id: string;
  content: string;
  timestamp: number;
  type: "user" | "system";
}

export interface CommandResponse {
  message: string;
  content: SiteContent;
}
