"use client";

import { cn } from "../utils/cn";
import { ReactNode, useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Sparkles, User, Terminal, Copy, Check, ChevronDown, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./data-display";

// Typing & Thinking Indicators
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export function ThinkingIndicator({ label = "Thinking..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 dark:text-indigo-400 animate-pulse">
      <Sparkles className="w-3.5 h-3.5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

// CodeBlock
export function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900/50 my-3 text-left">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900 text-xs font-mono font-bold text-slate-500">
        <span>{language}</span>
        <button onClick={handleCopy} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 flex items-center gap-1 cursor-pointer">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-sm leading-relaxed text-slate-850 dark:text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// MarkdownRenderer (Basic custom block parser for rendering simple structures)
export function MarkdownRenderer({ content }: { content: string }) {
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {blocks.map((block, idx) => {
        if (block.startsWith("```")) {
          const lines = block.split("\n");
          const firstLine = lines[0].replace("```", "").trim();
          const language = firstLine || "text";
          const code = lines.slice(1, -1).join("\n");
          return <CodeBlock key={idx} code={code} language={language} />;
        }
        
        return (
          <p key={idx} className="whitespace-pre-wrap leading-relaxed text-sm">
            {block}
          </p>
        );
      })}
    </div>
  );
}

// MessageBubble
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  thinking?: string;
}

export function MessageBubble({ message }: { message: Message }) {
  const isAi = message.role === "assistant";
  const [showThinking, setShowThinking] = useState(false);

  return (
    <div className={cn("flex gap-3 text-left w-full max-w-3xl", isAi ? "self-start" : "self-end flex-row-reverse")}>
      <Avatar
        fallback={isAi ? "AI" : "ME"}
        className={cn("w-8 h-8 rounded-xl", isAi ? "bg-indigo-500 text-white" : "bg-slate-200 dark:bg-slate-900")}
      />
      <div className="space-y-1.5 flex-1 max-w-[85%]">
        <div className="flex items-center gap-2 justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {isAi ? "Assistant" : "You"}
          </span>
          {message.timestamp && (
            <span className="text-[10px] text-slate-400 font-mono">{message.timestamp}</span>
          )}
        </div>

        {/* Thinking block if AI had intermediate thoughts */}
        {isAi && message.thinking && (
          <div className="border-l-2 border-indigo-200 dark:border-indigo-900 pl-3 py-0.5 space-y-1 mb-2">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="text-xs font-semibold text-slate-400 hover:text-indigo-400 flex items-center gap-1 focus:outline-none cursor-pointer"
            >
              {showThinking ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Thought process</span>
            </button>
            {showThinking && (
              <p className="text-xs text-slate-400 italic leading-relaxed whitespace-pre-wrap">
                {message.thinking}
              </p>
            )}
          </div>
        )}

        <div
          className={cn(
            "p-4 rounded-2xl border",
            isAi
              ? "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-850 rounded-tl-none text-slate-800 dark:text-slate-100"
              : "bg-indigo-600 border-indigo-700 rounded-tr-none text-white"
          )}
        >
          <MarkdownRenderer content={message.content} />
        </div>
      </div>
    </div>
  );
}

// ToolCallRenderer
export interface ToolCall {
  name: string;
  arguments: any;
  result?: any;
  status: "running" | "success" | "error";
}

export function ToolCallRenderer({ tool }: { tool: ToolCall }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900/40 text-left my-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100/50 dark:bg-slate-900 text-xs font-mono font-bold cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Call tool: <code className="text-indigo-500">{tool.name}</code></span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px]",
              tool.status === "success" && "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500",
              tool.status === "error" && "bg-red-50 dark:bg-red-950/20 text-red-500",
              tool.status === "running" && "bg-amber-50 dark:bg-amber-950/20 text-amber-500"
            )}
          >
            {tool.status}
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div>
            <p className="text-slate-400 font-bold mb-1">ARGUMENTS:</p>
            <pre className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 overflow-x-auto text-slate-700 dark:text-slate-350">
              {JSON.stringify(tool.arguments, null, 2)}
            </pre>
          </div>
          {tool.result && (
            <div>
              <p className="text-slate-400 font-bold mb-1">RESULT:</p>
              <pre className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 overflow-x-auto text-emerald-600 dark:text-emerald-400">
                {JSON.stringify(tool.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ConversationSidebar
export interface ChatSession {
  id: string;
  title: string;
  active?: boolean;
}

export function ConversationSidebar({
  sessions,
  onSelectSession,
  onNewChat,
}: {
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  onNewChat?: () => void;
}) {
  return (
    <div className="w-64 h-full border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex flex-col justify-between text-left">
      <div className="space-y-4">
        <button
          onClick={onNewChat}
          className="w-full h-11 border border-dashed border-slate-350 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition font-bold text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>
        <div className="space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={cn(
                "w-full px-3 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer",
                s.active && "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-indigo-650 dark:text-indigo-400"
              )}
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ChatWindow
export interface ChatWindowProps {
  title?: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  loading?: boolean;
  tools?: ToolCall[];
}

export function ChatWindow({ title = "AI Copilot", messages, onSendMessage, loading, tools }: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, tools]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex-1 flex flex-col h-full border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between text-left">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-indigo-500 text-white shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-none">{title}</h4>
            <span className="text-[10px] text-slate-400 font-medium">Next-gen Gemini engine</span>
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-slate-50/10 dark:bg-slate-950/5">
        {messages.length === 0 && (
          <div className="my-auto text-center space-y-2 max-w-sm mx-auto">
            <Sparkles className="w-8 h-8 text-indigo-500 mx-auto animate-pulse" />
            <h5 className="font-bold text-sm text-slate-850 dark:text-white">Ask anything</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type your query below to chat with the assistant and dispatch mock tasks.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {tools && tools.map((t, idx) => <ToolCallRenderer key={idx} tool={t} />)}

        {loading && <TypingIndicator />}
      </div>

      {/* Input container */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <button
          onClick={handleSend}
          className="p-3 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}

// StreamingResponse wrapper simulating real-time letter updates
export function StreamingResponse({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < text.length) {
        setDisplayed((prev) => prev + text.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="relative font-mono text-sm leading-relaxed text-slate-850 dark:text-slate-200">
      <span>{displayed}</span>
      <span className="w-1.5 h-4 bg-indigo-500 inline-block animate-pulse ml-0.5" />
    </div>
  );
}
