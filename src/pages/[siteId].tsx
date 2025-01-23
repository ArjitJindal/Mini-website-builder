import { GetServerSideProps } from "next";
import { siteService } from "../services/site-service";
import { SiteContent } from "../types";
import { SitePreview } from "../components/SitePreview";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { formatDate } from "../utils/date-formatter";

interface PageProps {
  siteId: string;
  initialContent: SiteContent;
}

export default function PublishedPage({ siteId, initialContent }: PageProps) {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [lastUpdated, setLastUpdated] = useState(
    formatDate(initialContent.lastUpdated)
  );

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
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

          socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
          });

          socket.on("connect", () => {
            console.log("Published page connected to Socket.IO");
            socket.emit("join-site", siteId);
          });

          socket.on("disconnect", () => {});

          socket.on("site-content", (updatedContent: SiteContent) => {
            console.log("Published page received initial content:", {
              heading: updatedContent.heading,
              theme: updatedContent.theme,
              timestamp: new Date().toISOString(),
            });
            setContent(updatedContent);
            setLastUpdated(formatDate(updatedContent.lastUpdated));
          });

          socket.on("content-updated", (updatedContent: SiteContent) => {
            console.log("Published page received content update:", {
              heading: updatedContent.heading,
              theme: updatedContent.theme,
              timestamp: new Date().toISOString(),
            });
            setContent(updatedContent);
            setLastUpdated(formatDate(updatedContent.lastUpdated));
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

  return (
    <>
      <Head>
        <title>{content.heading} | Website Builder</title>
        <meta name="description" content={content.paragraphs[0]} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {content.heading}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      socketRef.current?.connected
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm text-gray-500">
                    {socketRef.current?.connected ? "Live" : "Connecting..."}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Last updated: {lastUpdated}
                </span>
                <Link
                  href={`/edit/${siteId}`}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Site
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <SitePreview content={content} />
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const siteId = context.params?.siteId as string;
    console.log("Fetching initial content for site:", siteId);
    const content = await siteService.getSite(siteId);
    console.log("Initial content fetched:", {
      heading: content.heading,
      paragraphCount: content.paragraphs.length,
      theme: content.theme,
    });

    return {
      props: {
        siteId,
        initialContent: content,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      notFound: true,
    };
  }
};
