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
}

export interface Log {
  id: string;
  content: string;
  timestamp: number;
  type: "user" | "system";
}

export interface CommandResponse {
  success: boolean;
  message: string;
  content?: SiteContent;
  error?: string;
}
