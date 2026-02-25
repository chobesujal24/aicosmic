import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Play, Eye, Download, Maximize2, Code2, ExternalLink, Bot, User, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  model?: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

const modelDisplayNames: Record<string, string> = {
  'deepseek-chat': 'DeepSeek V3',
  'deepseek-reasoner': 'DeepSeek R1',
  'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
  'claude-3-7-sonnet': 'Claude 3.7 Sonnet',
  'claude-sonnet-4': 'Claude Sonnet 4',
  'claude-opus-4': 'Claude Opus 4',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-5-chat-latest': 'GPT-5 Chat',
  'gpt-5-nano': 'GPT-5 Nano',
  'gpt-4.1-nano': 'GPT-4.1 Nano',
  'o1': 'o1',
  'o1-pro': 'o1-pro',
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
  'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo': 'Llama 3.1 405B',
  'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo': 'Llama 3.1 70B',
  'mistral-large-latest': 'Mistral Large',
  'grok-3-beta': 'Grok 3',
  'grok-3-mini-beta': 'Grok 3 Mini'
};

export const ChatMessage = ({ message, isUser, timestamp, model, isStreaming, onRegenerate, showRegenerate }: ChatMessageProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const safeMessage = typeof message === 'string' ? message : String(message || 'Invalid message format');

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={cn(
      "flex w-full group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] sm:max-w-[80%] md:max-w-[75%] px-5 py-4 rounded-xl transition-all duration-300 relative",
        isUser
          ? "bg-neutral-800 text-white ml-4 sm:ml-8 md:ml-16"
          : "bg-transparent text-neutral-200 mr-4 sm:mr-8 md:mr-16"
      )}>
        {!isUser && (
          <div className="absolute -left-12 top-4 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <Bot className="w-4 h-4 text-neutral-400" />
          </div>
        )}

        {isUser && (
          <div className="absolute -right-12 top-4 w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
            <User className="w-4 h-4 text-neutral-400" />
          </div>
        )}

        {isUser ? (
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {safeMessage}
          </div>
        ) : (
          <div>
            {model && model !== 'system' && model !== 'error' && (
              <div className="text-[11px] text-neutral-500 mb-3 uppercase tracking-wider font-semibold flex items-center gap-2">
                {modelDisplayNames[model] || model}
              </div>
            )}
            <div className={cn("prose prose-invert prose-p:leading-relaxed max-w-none text-[15px]", isStreaming && 'animate-pulse')}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4 last:mb-0 break-words">{children}</p>,
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const isInline = !className || !language;
                    const codeContent = String(children).replace(/\n$/, '');

                    if (!isInline && language) {
                      return (
                        <div className="my-5">
                          <div className="relative group/code rounded-xl overflow-hidden border border-neutral-800 bg-[#1E1E1E]">
                            <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
                              <span className="text-xs font-mono text-neutral-400 lowercase">{language}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(codeContent)}
                                className="h-7 px-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all rounded-md flex items-center gap-1.5"
                                title="Copy code"
                              >
                                {copiedCode === codeContent ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-xs text-green-400 font-medium">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">Copy</span>
                                  </>
                                )}
                              </Button>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={language}
                              PreTag="div"
                              className="!mt-0 !mb-0 text-sm scrollbar-thin scrollbar-thumb-neutral-700 hover:scrollbar-thumb-neutral-600"
                              customStyle={{
                                margin: 0,
                                padding: '16px 20px',
                                background: 'transparent',
                                fontSize: '13.5px',
                                lineHeight: '1.65',
                              }}
                            >
                              {codeContent}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <code className="bg-neutral-800/50 px-1.5 py-0.5 rounded text-[13px] font-mono border border-neutral-700/50 text-neutral-300" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <div className="my-3 overflow-x-auto">{children}</div>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors break-all"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 pl-2 text-neutral-300 marker:text-neutral-500">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 pl-2 text-neutral-300 marker:text-neutral-500">{children}</ol>,
                  li: ({ children }) => <li className="break-words leading-relaxed pl-1">{children}</li>,
                  h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4 tracking-tight text-white border-b border-neutral-800 pb-2 break-words">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mt-8 mb-4 tracking-tight text-white break-words">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold mt-6 mb-3 tracking-tight text-white break-words">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-neutral-700 pl-4 italic my-4 break-words bg-neutral-900/50 py-2 rounded-r-lg text-neutral-400">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border border-neutral-800 rounded-lg">
                      <table className="min-w-full divide-y divide-neutral-800">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-neutral-900">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-neutral-800 bg-[#0a0a0a]">{children}</tbody>,
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-neutral-300 whitespace-normal">
                      {children}
                    </td>
                  ),
                }}
              >
                {safeMessage}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Actions Row */}
        <div className={cn(
          "flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "hidden" : "justify-start"
        )}>
          {!isUser && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(safeMessage)}
                className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                title="Copy full message"
              >
                {copiedCode === safeMessage ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>

              {showRegenerate && onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRegenerate}
                  disabled={isStreaming}
                  className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                  title="Regenerate response"
                >
                  <RefreshCw className={cn("w-4 h-4", isStreaming && "animate-spin")} />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};