import { NextApiRequest, NextApiResponse } from "next";
import { siteService } from "../../../../services/site-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { siteId } = req.query;
  const content = await siteService.getSite(siteId as string);

  res.status(200).json(content);
}
