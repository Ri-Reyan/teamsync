"use client";

import { isAxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

type Conversation = {
  topic: string;
  result: string;
};

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type ProjectAIAssistantProps = {
  workspaceId: string;
  projectId: string;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  isAxiosError(error) ? error.response?.data?.message || fallback : fallback;

export default function ProjectAIAssistant({
  workspaceId,
  projectId,
}: ProjectAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const endpoint = `/user/workspace/${workspaceId}/project/${projectId}/ai`;

  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || messages.length > 0) return;

    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const response = await api.get<{ data: Conversation[] | null }>(
          `${endpoint}/conversations`,
        );
        const history = response.data.data || [];
        setMessages(
          history.map((conversation, index) => ({
            id: `history-${index}`,
            role: "assistant",
            content: conversation.result,
          })),
        );
      } catch (error: unknown) {
        showToast.error(getErrorMessage(error, "Could not load AI history"));
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [endpoint, isOpen, messages.length]);

  const addMessage = (role: Message["role"], content: string) => {
    setMessages((current) => [
      ...current,
      { id: `${role}-${Date.now()}`, role, content },
    ]);
  };

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userPrompt = prompt.trim();
    if (!userPrompt || isSending) return;

    addMessage("user", userPrompt);
    setPrompt("");
    setIsSending(true);

    try {
      const response = await api.post<{ data: { result: string } }>(
        `${endpoint}/chat`,
        { user_prompt: userPrompt },
      );
      addMessage("assistant", response.data.data.result);
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "AI could not answer right now"));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleGenerateSummary = async () => {
    if (isGeneratingSummary) return;
    setIsGeneratingSummary(true);

    try {
      const response = await api.post<{ data: { result: string } }>(
        `${endpoint}/summary`,
      );
      const result = response.data.data.result;
      setSummary(result);
      addMessage("assistant", result);
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Could not generate summary"));
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open project AI chat"
        className="flex items-center gap-2 border-4 border-black bg-[#9B8AFB] px-4 py-3 text-xs font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <MessageCircle className="h-4 w-4 stroke-[2.5]" />
        <span>Project AI</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-ai-title"
        >
          <button
            type="button"
            aria-label="Close project AI chat"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
          />

          <section className="relative flex h-full w-full max-w-xl flex-col border-l-4 border-black bg-[#FFFDF5] shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)]">
            <header className="border-b-4 border-black bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="border-2 border-black bg-[#9B8AFB] p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Bot className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
                      Teamsync AI
                    </p>
                    <h2
                      id="project-ai-title"
                      className="mt-1 text-xl font-black uppercase tracking-tight"
                    >
                      Project companion
                    </h2>
                    <p className="mt-1 text-xs font-bold text-gray-600">
                      Ask about progress, priorities, or project risks.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close AI chat"
                  className="border-2 border-black bg-[#FF6B6B] p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-400"
                >
                  <X className="h-4 w-4 stroke-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="mt-5 flex w-full items-center justify-center gap-2 border-3 border-black bg-[#6BCB77] px-4 py-3 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-60"
              >
                {isGeneratingSummary ? (
                  <HypotrochoidLoader size={16} color="#000000" />
                ) : (
                  <Sparkles className="h-4 w-4 fill-black" />
                )}
                {isGeneratingSummary
                  ? "Generating..."
                  : "Generate project summary"}
              </button>
            </header>

            <div
              className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6"
              aria-live="polite"
            >
              {summary && (
                <div className="border-3 border-black bg-[#E9E2FF] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em]">
                    Latest summary
                  </p>
                  <p className="whitespace-pre-wrap text-sm font-bold leading-6">
                    {summary}
                  </p>
                </div>
              )}

              {isLoadingHistory && (
                <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-500">
                  <HypotrochoidLoader size={16} color="#6B7280" /> Loading
                  conversation...
                </div>
              )}

              {!isLoadingHistory && messages.length === 0 && (
                <div className="border-3 border-dashed border-black bg-white p-5 text-center">
                  <p className="text-sm font-black uppercase">
                    Start the conversation
                  </p>
                  <p className="mt-1 text-xs font-bold text-gray-600">
                    Try “What are our biggest blockers?”
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[92%] border-3 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                    message.role === "user"
                      ? "ml-auto bg-[#4D96FF] text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
                    {message.role === "user" ? "You" : "TeamSync AI"}
                  </p>
                  <p className="whitespace-pre-wrap text-sm font-bold leading-6">
                    {message.content}
                  </p>
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 border-3 border-black bg-white p-4 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <HypotrochoidLoader size={16} color="#000000" /> Thinking...
                </div>
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="border-t-4 border-black bg-white p-5 sm:p-6"
            >
              <label
                htmlFor="project-ai-prompt"
                className="mb-2 block text-xs font-black uppercase"
              >
                Your prompt
              </label>
              <textarea
                ref={inputRef}
                id="project-ai-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                maxLength={1500}
                rows={3}
                required
                placeholder="Ask something about this project..."
                className="w-full resize-none border-3 border-black bg-[#FFFDF5] p-3 text-sm font-bold outline-none placeholder:text-gray-500 focus:bg-yellow-50"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase text-gray-500">
                  Shift + Enter for a new line
                </span>
                <button
                  type="submit"
                  disabled={isSending || !prompt.trim()}
                  className="flex items-center gap-2 border-3 border-black bg-[#FFD93D] px-4 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4 stroke-[2.5]" /> Send
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
