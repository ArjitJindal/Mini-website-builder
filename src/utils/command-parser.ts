import { ThemeType } from "../types";
import { aiService } from "../services/ai-service";

interface ParsedCommand {
  type: "heading" | "paragraph" | "image" | "theme" | "unknown";
  content: string;
}

const THEME_OPTIONS: ThemeType[] = ["default", "modern", "minimal", "elegant"];

export const parseCommand = async (command: string): Promise<ParsedCommand> => {
  const normalizedCommand = command.toLowerCase().trim();

  if (
    normalizedCommand.startsWith("change heading to ") ||
    normalizedCommand.startsWith("set heading as ") ||
    normalizedCommand.startsWith("make heading ") ||
    normalizedCommand.startsWith("update heading to ")
  ) {
    const content = command
      .replace(/^(change|set|make|update)\sheading\s(to|as)\s/i, "")
      .trim();
    return { type: "heading", content };
  }

  if (
    normalizedCommand.startsWith("change paragraph to ") ||
    normalizedCommand.startsWith("set paragraph as ") ||
    normalizedCommand.startsWith("make paragraph ") ||
    normalizedCommand.startsWith("update paragraph to ")
  ) {
    const content = command
      .replace(/^(change|set|make|update)\sparagraph\s(to|as)\s/i, "")
      .trim();
    return { type: "paragraph", content };
  }

  if (
    normalizedCommand.startsWith("add image:") ||
    normalizedCommand.startsWith("insert image:") ||
    normalizedCommand.startsWith("upload image:")
  ) {
    const content = command
      .replace(/^(add|insert|upload)\simage:\s*/i, "")
      .trim();

    console.log("Processing image command with content:", content);

    const [url, alt = "", caption = ""] = content
      .split("|")
      .map((s) => s.trim());
    if (!url.startsWith("http")) {
      throw new Error("Invalid image URL. Must start with http:// or https://");
    }

    return {
      type: "image",
      content: `${url}|${alt}|${caption}`,
    };
  }

  if (
    normalizedCommand.startsWith("change theme to ") ||
    normalizedCommand.startsWith("set theme as ") ||
    normalizedCommand.startsWith("switch theme to ")
  ) {
    const themeInput = command
      .replace(/^(change|set|switch)\stheme\s(to|as)\s/i, "")
      .trim()
      .toLowerCase();

    const matchedTheme = THEME_OPTIONS.find(
      (theme) => theme.toLowerCase() === themeInput
    );
    if (matchedTheme) {
      return { type: "theme", content: matchedTheme };
    }

    throw new Error(
      `Invalid theme. Available options: ${THEME_OPTIONS.join(", ")}`
    );
  }

  if (normalizedCommand.startsWith("ai:")) {
    try {
      const prompt = command.replace(/^ai:\s*/i, "").trim();
      const response = await aiService.processCommand(prompt);

      if (!response.success) {
        throw new Error(response.error || "AI processing failed");
      }

      if (response.content?.heading) {
        return { type: "heading", content: response.content.heading };
      } else if (response.content?.paragraphs?.[0]) {
        return { type: "paragraph", content: response.content.paragraphs[0] };
      } else if (response.content?.theme) {
        return { type: "theme", content: response.content.theme };
      }
    } catch (error) {
      throw new Error(
        `AI Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return {
    type: "unknown",
    content: `Command not recognized. Available commands:
• "change heading to [text]" - Update the main heading
• "change paragraph to [text]" - Update the paragraph
• "set paragraph as [text]" - Another way to update the paragraph
• "make paragraph [text]" - Another way to update the paragraph
• "add image: [url] | [alt] | [caption]" - Add an image with alt text and caption
• "change theme to [theme]" - Change theme (${THEME_OPTIONS.join(", ")})
• "ai: [prompt]" - Use AI to generate content`,
  };
};

export const generateResponse = (command: ParsedCommand): string => {
  switch (command.type) {
    case "heading":
      return `Updated heading to: "${command.content}"`;
    case "theme":
      return `Changed theme to: ${command.content}`;
    case "paragraph":
      return `Updated paragraph: "${command.content.slice(0, 50)}${
        command.content.length > 50 ? "..." : ""
      }"`;
    case "image":
      const [, , caption] = command.content.split("|").map((s) => s.trim());
      return `Added new image${caption ? ` with caption: "${caption}"` : ""}`;
    default:
      return command.content;
  }
};
