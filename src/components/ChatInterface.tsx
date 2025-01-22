import { useState, useRef, useEffect } from "react";
import { Log } from "../types";

interface ChatInterfaceProps {
  logs: Log[];
  onSendMessage: (message: string) => void;
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

export function ChatInterface({ logs, onSendMessage }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
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
    <div className="bg-white rounded-2xl shadow-soft">
      <div
        ref={chatContainerRef}
        className="h-[calc(100vh-220px)] overflow-y-auto p-6 space-y-4"
      >
        {/* Command Help */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          {renderHelpText()}
        </div>

        {/* Chat Messages */}
        {logs.map((log) => (
          <div
            key={log.id}
            className={`chat-message p-4 rounded-lg ${
              log.type === "user"
                ? "bg-blue-50 border border-blue-100 ml-auto max-w-[80%]"
                : "bg-gray-50 border border-gray-100 mr-auto max-w-[80%]"
            }`}
          >
            <p
              className={`${
                log.type === "user" ? "text-blue-900" : "text-gray-900"
              }`}
            >
              {log.content}
            </p>
            <span className="text-xs text-gray-500 mt-1.5 block">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a command... (e.g., 'change heading to Hello World')"
            className="flex-1 px-4 py-2.5 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg transition-all duration-200 ease-in-out hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
