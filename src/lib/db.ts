import { SiteContent } from "../types";
import { siteService } from "../services/site-service";

const sites = new Map<string, SiteContent>();

export const getSiteContent = async (siteId: string): Promise<SiteContent> => {
  if (!sites.has(siteId)) {
    const content = await siteService.generateInitialContent(siteId);
    sites.set(siteId, content);
    return content;
  }
  return sites.get(siteId)!;
};

export const updateSiteContent = async (
  siteId: string,
  updateFn: (current: SiteContent) => SiteContent
): Promise<SiteContent> => {
  const currentContent = await getSiteContent(siteId);
  const updatedContent = updateFn(currentContent);
  sites.set(siteId, updatedContent);
  return updatedContent;
};

export const deleteSite = (siteId: string): void => {
  sites.delete(siteId);
};

export const listSites = (): string[] => {
  return Array.from(sites.keys());
};
