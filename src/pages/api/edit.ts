import type { NextApiRequest, NextApiResponse } from "next";
import { updateSiteContent } from "../../lib/db";
import { EditRequest } from "../../types/content";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { siteId, content } = req.body as EditRequest;
    updateSiteContent(siteId, {
      heading: content,
      paragraph: "Updated via chat!",
      imageUrl: "default-image-url.jpg",
    });
    res.status(200).json({ message: "Content updated successfully" });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
