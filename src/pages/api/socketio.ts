import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { updateSiteContent, getSiteContent } from "../../lib/db";
import { parseCommand } from "../../utils/command-parser";
import { ThemeType } from "../../types";
import { Socket as NetSocket } from "net";
import { SiteContent } from "../../types";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

interface SocketServer extends NetServer {
  io?: ServerIO;
}

interface NextApiResponseSocket extends NextApiResponse {
  socket: NetSocket & {
    server: SocketServer;
  };
}

const handleCommand = async (siteId: string, command: string) => {
  try {
    const parsed = await parseCommand(command);
    const currentContent = await getSiteContent(siteId);

    let updatedContent: SiteContent;

    switch (parsed.type) {
      case "heading":
        updatedContent = {
          ...currentContent,
          heading: parsed.content,
          lastUpdated: Date.now(),
        };
        break;
      case "paragraph":
        updatedContent = {
          ...currentContent,
          paragraphs: [parsed.content],
          lastUpdated: Date.now(),
        };
        break;
      case "image":
        const [url, alt = "", caption] = parsed.content
          .split("|")
          .map((s) => s.trim());
        updatedContent = {
          ...currentContent,
          images: [...currentContent.images, { url, alt, caption }],
          lastUpdated: Date.now(),
        };
        break;
      case "theme":
        updatedContent = {
          ...currentContent,
          theme: parsed.content as ThemeType,
          lastUpdated: Date.now(),
        };
        break;
      default:
        updatedContent = currentContent;
    }

    await updateSiteContent(siteId, () => updatedContent);
    return updatedContent;
  } catch (error) {
    console.error("Error processing command:", error);
    throw error;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseSocket
) {
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      cors: {
        origin: "*", // Allow all origins in development
        methods: ["GET", "POST"],
        credentials: true,
      },
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    io.on("connection", (socket) => {
      console.log("Client connected");

      socket.on("join-site", async (siteId: string) => {
        try {
          console.log("Client joining site:", siteId);
          socket.join(siteId);
          const content = await getSiteContent(siteId);
          console.log("Sending initial content to client:", {
            heading: content.heading,
            paragraphCount: content.paragraphs.length,
            theme: content.theme,
            socketId: socket.id,
          });
          io.to(siteId).emit("site-content", content);
        } catch (error) {
          console.error("Error joining site:", error);
          socket.emit("command-error", {
            message: "Failed to load site content",
          });
        }
      });

      socket.on(
        "send-command",
        async ({ siteId, command }: { siteId: string; command: string }) => {
          try {
            console.log(
              "Processing command for site:",
              siteId,
              "Command:",
              command
            );
            const updatedContent = await handleCommand(siteId, command);
            console.log("Broadcasting updated content:", {
              heading: updatedContent.heading,
              paragraphCount: updatedContent.paragraphs.length,
              theme: updatedContent.theme,
              socketId: socket.id,
            });
            io.to(siteId).emit("content-updated", updatedContent);
          } catch (error) {
            console.error("Error processing command:", error);
            socket.emit("command-error", {
              message: "Failed to process command",
            });
          }
        }
      );

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
