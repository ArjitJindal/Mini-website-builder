import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SiteContent, Log } from "../../types";
import { ChatInterface } from "../../components/ChatInterface";
import { SitePreview } from "../../components/SitePreview";
import Head from "next/head";
import Link from "next/link";
import { formatDate } from "@/utils/date-formatter";

export default function Editor() {
  const router = useRouter();
  const { siteId } = router.query;
  const [logs, setLogs] = useState<Log[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!siteId) return;

    // Fetch initial content
    fetch(`/api/sites/${siteId}`)
      .then((res) => res.json())
      .then((content) => {
        setSiteContent(content);
        setLastUpdated(formatDate(content.lastUpdated));
      })
      .catch(() => {
        router.push("/404");
      });

    const socketInitializer = async () => {
      try {
        if (!socketRef.current) {
          const socket = io({
            path: "/api/socketio",
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 45000,
            transports: ["websocket"],
            forceNew: true,
            auth: {
              siteId,
            },
            withCredentials: true,
            autoConnect: false,
          });

          socket.on("connect_error", () => {});

          socket.on("connect", () => {
            socket.emit("join-site", siteId);
          });

          socket.on("disconnect", () => {});

          socket.on("site-content", (updatedContent: SiteContent) => {
            setSiteContent(updatedContent);
            setLastUpdated(formatDate(updatedContent.lastUpdated));
          });

          socket.on("content-updated", (updatedContent: SiteContent) => {
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

          socketRef.current = socket;
          socket.connect();
        }
      } catch (error) {
        console.error("Socket initialization error:", error);
      }
    };

    socketInitializer();

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [siteId]);

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !siteId || !socketRef.current) return;

    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: message,
        timestamp: Date.now(),
        type: "user",
      },
    ]);

    socketRef.current.emit("send-command", { siteId, command: message });
  };

  if (!siteContent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <span className="text-gray-400">•</span>
                <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <div className="w-1/2">
              <div className="h-[600px] bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div className="w-1/2">
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-40 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-60 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
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

        <main className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <div className="w-1/2">
              <ChatInterface
                logs={logs}
                onSendMessage={handleSendMessage}
                SocketRef={socketRef}
              />
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
