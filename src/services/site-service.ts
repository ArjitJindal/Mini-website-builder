import { SiteContent, ThemeType } from "../types";
import OpenAI from "openai";
import { aiService } from "./ai-service";
import { getRandomFallbackImage } from "../utils/fallback-images";

const sites = new Map<string, SiteContent>();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.error("OpenAI API key is not configured!");
}

console.log(
  "OpenAI API key status:",
  process.env.OPENAI_API_KEY ? "Present" : "Missing"
);

export const siteService = {
  generateInitialContent: async (siteId: string): Promise<SiteContent> => {
    try {
      console.log("Starting AI content generation for site:", siteId);

      let heading = "";
      let paragraph = "";
      let theme: ThemeType = "default";

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Generate website content based on the site ID. 
              Create engaging, relevant content that matches the site's implied purpose.
              Keep the heading concise and catchy.
              Generate a single informative paragraph.`,
            },
            {
              role: "user",
              content: `Generate content for a website with ID: "${siteId}". 
              Consider any words or meaning in the ID to inform the content theme.
              Format: 
              Heading: [heading]
              Paragraph: [paragraph]`,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          const lines = content.split("\n").filter((line) => line.trim());
          heading = lines[0].replace(/^(Heading:|#)\s*/, "").trim();
          paragraph =
            lines
              .find((line) => line.startsWith("Paragraph:"))
              ?.replace(/^Paragraph:\s*/, "")
              .trim() || "";
        }
      } catch (aiError) {
        console.error("Error generating AI content:", aiError);
        heading = `Welcome to ${siteId}`;
        paragraph = "Start editing this site via chat commands!";
      }

      let imageUrl = "";
      try {
        console.log("Starting DALL-E image generation...");
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Create a professional, modern website header image related to: ${siteId}. 
          The image should be clean, minimalist, and suitable for a website header.
          Style: professional and modern
          Colors: subtle and harmonious
          No text in the image`,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        });

        imageUrl = imageResponse.data[0]?.url || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (imageError: any) {
        console.error("Error generating image:", imageError);
        if (imageError?.error?.type === "insufficient_quota") {
          console.log("OpenAI quota exceeded - using fallback image");
        }
        const fallbackImage = getRandomFallbackImage();
        imageUrl = fallbackImage.url;
      }

      try {
        theme = (await aiService.suggestTheme({
          heading,
          paragraphs: [paragraph],
          images: [],
          theme: "default",
          lastUpdated: Date.now(),
        })) as ThemeType;
      } catch (themeError) {
        console.error("Error suggesting theme:", themeError);
        theme = "default";
      }

      const siteContent: SiteContent = {
        heading: heading || `Welcome to ${siteId}`,
        paragraphs: [paragraph || "Start editing this site via chat commands!"],
        images: [
          {
            url: imageUrl,
            alt: `Header image for ${siteId}`,
            caption: `Website image for ${siteId}`,
          },
        ],
        theme,
        lastUpdated: Date.now(),
      };

      console.log("Site content before saving:", {
        heading: siteContent.heading,
        paragraph: siteContent.paragraphs[0],
        imageUrl: siteContent.images[0]?.url,
        theme: siteContent.theme,
      });

      sites.set(siteId, siteContent);
      return siteContent;
    } catch (error) {
      console.error("Error in generateInitialContent:", error);
      const fallbackImage = getRandomFallbackImage();
      return {
        heading: `Welcome to ${siteId}`,
        paragraphs: ["Start editing this site via chat commands!"],
        images: [
          {
            url: fallbackImage.url,
            alt: fallbackImage.alt,
            caption: fallbackImage.caption,
          },
        ],
        theme: "default",
        lastUpdated: Date.now(),
      };
    }
  },

  getSite: async (siteId: string): Promise<SiteContent> => {
    if (!sites.has(siteId)) {
      return await siteService.generateInitialContent(siteId);
    }
    return sites.get(siteId)!;
  },

  updateSite: (
    siteId: string,
    updater: (current: SiteContent) => Partial<SiteContent>
  ): SiteContent => {
    const currentContent = sites.get(siteId);
    if (!currentContent) {
      throw new Error("Site not found");
    }

    const updates = updater(currentContent);
    const updatedContent = {
      ...currentContent,
      ...updates,
      lastUpdated: Date.now(),
    };

    sites.set(siteId, updatedContent);
    return updatedContent;
  },
};
