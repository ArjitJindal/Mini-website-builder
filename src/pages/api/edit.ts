import { NextApiRequest, NextApiResponse } from "next";
import { updateSiteContent } from "../../lib/db";
import { EditRequest } from "../../types";
import { CommandResponse } from "../../types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommandResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { siteId, command }: EditRequest = req.body;

    if (!siteId || !command) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const updatedContent = await updateSiteContent(siteId, (current) => ({
      ...current,
      lastUpdated: Date.now(),
    }));

    return res.status(200).json({
      success: true,
      message: "Content updated successfully",
      content: updatedContent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
