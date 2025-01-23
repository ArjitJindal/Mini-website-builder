import { useState, useRef, useEffect } from "react";
import { Log } from "../types";

interface ChatInterfaceProps {
  logs: Log[];
  onSendMessage: (message: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SocketRef: any;
}

const AVAILABLE_COMMANDS = [
  {
    title: "Update Heading",
    examples: [
      "change heading to New Heading",
      "set heading as My Heading",
      "make heading Welcome to My Site",
    ],
  },
  {
    title: "Update Paragraph",
    examples: [
      "change paragraph to New content here",
      "set paragraph as This is my paragraph",
      "make paragraph This describes my website",
    ],
  },
  {
    title: "Change Theme",
    examples: [
      "change theme to modern",
      "change theme to minimal",
      "change theme to elegant",
    ],
  },
  {
    title: "Add Image",
    examples: [
      "add image: https://example.com/image.jpg | Alt text | Caption",
      "add image: https://example.com/photo.png | My Photo | A beautiful scene",
    ],
  },
  {
    title: "AI Assistance",
    examples: [
      "ai: suggest a heading about technology",
      "ai: write a paragraph about nature",
      "ai: recommend a theme for a portfolio",
    ],
  },
];

export function ChatInterface({
  logs,
  onSendMessage,
  SocketRef,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const socket = SocketRef.current;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSend = () => {
    if (!message.trim() || !socket.connected) return;
    onSendMessage(message);
    setMessage("");
  };

  const getInputPlaceholder = () => {
    if (!socket.connected) return "Connecting to server...";
    return 'Type a command... (e.g., "change heading to Hello World")';
  };

  const renderHelpText = () => (
    <div className="space-y-4 text-sm text-gray-600">
      <h3 className="font-semibold text-gray-700">Available Commands:</h3>
      {AVAILABLE_COMMANDS.map((category, index) => (
        <div key={index}>
          <h4 className="font-medium text-gray-700">{category.title}:</h4>
          <ul className="mt-1 space-y-1 list-disc list-inside pl-2">
            {category.examples.map((example, i) => (
              <li key={i} className="text-gray-500">
                <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                  {example}
                </code>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Chat Interface</h2>
        <div className="flex items-center mt-1 space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              socket.connected ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <span className="text-sm text-gray-500">
            {socket.connected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Command Help */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          {renderHelpText()}
        </div>

        {/* Chat Messages */}
        {logs.map((log) => (
          <div
            key={log.id}
            className={`flex ${
              log.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                log.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {log.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-4">
          <input
            type="text"
            value={message}
            disabled={!socket.connected}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={getInputPlaceholder()}
            className="flex-1 px-4 py-2.5 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!socket.connected || !message.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg transition-all duration-200 ease-in-out hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
