import { NextApiRequest, NextApiResponse } from "next";
import { CommandResponse, ThemeType } from "../../../../types";
import { updateSiteContent, getSiteContent } from "../../../../lib/db";
import { parseCommand } from "../../../../utils/command-parser";

const DEFAULT_CONTENT = {
  heading: "",
  paragraphs: [],
  images: [],
  theme: "light" as ThemeType,
  lastUpdated: new Date().getTime(),
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommandResponse>
) {
  if (req.method !== "POST") {
    try {
      const content = req.query.siteId
        ? await getSiteContent(req.query.siteId as string)
        : DEFAULT_CONTENT;
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
        content,
      });
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid site ID",
        content: DEFAULT_CONTENT,
      });
    }
  }

  const { command } = req.body;
  const siteId = req.query.siteId as string;

  if (!command || typeof command !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid command format",
      content: DEFAULT_CONTENT,
    });
  }

  try {
    const parsed = await parseCommand(command);
    const updatedContent = await updateSiteContent(siteId, (current) => {
      switch (parsed.type) {
        case "heading":
          return { ...current, heading: parsed.content };
        case "paragraph":
          return {
            ...current,
            paragraphs: [...current.paragraphs, parsed.content],
          };
        case "image":
          const [url, alt = "", caption] = parsed.content
            .split("|")
            .map((s) => s.trim());
          return {
            ...current,
            images: [...current.images, { url, alt, caption }],
          };
        case "theme":
          return { ...current, theme: parsed.content as ThemeType };
        default:
          return current;
      }
    });

    return res.status(200).json({
      success: true,
      message: "Successfully updated content",
      content: updatedContent,
    });
  } catch (error) {
    console.error("Error updating site content:", error);
    try {
      const content = await getSiteContent(siteId);
      return res.status(500).json({
        success: false,
        message: "Error updating site content",
        content,
      });
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid site ID",
        content: DEFAULT_CONTENT,
      });
    }
  }
}
