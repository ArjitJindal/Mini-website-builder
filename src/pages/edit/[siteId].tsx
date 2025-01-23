import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { SiteContent, Log } from "../../types";
import { ChatInterface } from "../../components/ChatInterface";
import { SitePreview } from "../../components/SitePreview";
import Head from "next/head";
import Link from "next/link";
import { formatDate } from "@/utils/date-formatter";

let socket: Socket;

export default function Editor() {
  const router = useRouter();
  const { siteId } = router.query;
  const [logs, setLogs] = useState<Log[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    if (!siteId) return;

    // Socket.io setup
    const socketInitializer = async () => {
      try {
        socket = io({
          path: "/api/socketio",
          addTrailingSlash: false,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ["websocket", "polling"],
        });

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
        });

        socket.on("connect", () => {
          console.log("Connected to Socket.IO");
          socket.emit("join-site", siteId);
        });

        socket.on("site-content", (updatedContent: SiteContent) => {
          console.log("Edit page received initial content:", {
            heading: updatedContent.heading,
            theme: updatedContent.theme,
            timestamp: new Date().toISOString(),
          });
          setSiteContent(updatedContent);
          setLastUpdated(formatDate(updatedContent.lastUpdated));
        });

        socket.on("content-updated", (updatedContent: SiteContent) => {
          console.log("Edit page received content update:", {
            heading: updatedContent.heading,
            theme: updatedContent.theme,
            timestamp: new Date().toISOString(),
          });
          setSiteContent(updatedContent);
          setLastUpdated(formatDate(updatedContent.lastUpdated));
          setLogs((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              content: "Site updated successfully",
              timestamp: Date.now(),
              type: "system",
            },
          ]);
        });

        socket.on("command-error", (error) => {
          setLogs((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              content: error.message,
              timestamp: Date.now(),
              type: "system",
            },
          ]);
        });
      } catch (error) {
        console.error("Socket initialization error:", error);
      }
    };

    socketInitializer();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [siteId]);

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !siteId) return;

    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: message,
        timestamp: Date.now(),
        type: "user",
      },
    ]);

    socket.emit("send-command", { siteId, command: message });
  };

  if (!siteContent) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Edit Site: {siteId} | Website Builder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Editing: <span className="text-blue-600">{siteId}</span>
                </h2>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500">
                  Last updated: {lastUpdated}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href={`/${siteId}`}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  target="_blank"
                >
                  View Live Site
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <div className="w-1/2">
              <ChatInterface logs={logs} onSendMessage={handleSendMessage} />
            </div>
            <div className="w-1/2">
              <SitePreview content={siteContent} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
