import { NextApiRequest, NextApiResponse } from "next";
import { CommandResponse } from "../../../../types";
import { updateSiteContent, getSiteContent } from "../../../../lib/db";
import { parseCommand } from "../../../../utils/command-parser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommandResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
      content: req.query.siteId
        ? getSiteContent(req.query.siteId as string)
        : DEFAULT_CONTENT,
    });
  }

  const { command } = req.body;
  const siteId = req.query.siteId as string;

  try {
    const parsed = parseCommand(command);
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

    res.status(200).json({
      message: "Successfully updated content",
      content: updatedContent,
    });
  } catch (error) {
    console.error("Error updating site content:", error);
    res.status(500).json({
      message: "Error updating site content.",
      content: getSiteContent(siteId),
    });
  }
}
