import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/AuthDialog';
import {
    ArrowLeft,
    Code2,
    Eye,
    Play,
    Loader2,
    Copy,
    Check,
    Sparkles,
    FileCode,
    RefreshCw,
    Send,
    Bot,
    User,
    Maximize2,
    Minimize2,
    Download,
    Terminal,
    LayoutPanelLeft
} from 'lucide-react';
import { puterService } from '@/lib/puterService';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isCode?: boolean;
}

interface AgentStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'done' | 'error';
    detail?: string;
}

const CodeAgent = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [copied, setCopied] = useState(false);
    const [steps, setSteps] = useState<AgentStep[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { user } = useAuth();
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    const SYSTEM_PROMPT = `You are an expert frontend developer and code generation agent. When given a prompt, you output a SINGLE, COMPLETE HTML file that implements the request.

STRICT RULES:
- Output ONLY raw HTML code. No markdown, no explanations, no \`\`\` fences.
- Include ALL CSS inside a <style> tag and ALL JS inside a <script> tag.
- Use modern, beautiful, premium design with smooth animations and transitions.
- Use this navy blue palette throughout: #011023 (deep bg), #052558 (card bg), #527FB0 (primary accent), #7C9FC9 (secondary), #C2E8FF (text/light).
- If Google Fonts improve the design, include the <link> tag.
- The output must be a complete, self-contained, fully functional HTML document.
- Make it responsive and pixel-perfect.
- Add micro-interactions and hover effects for a premium feel.`;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const updateStep = (id: string, updates: Partial<AgentStep>) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const cleanCode = (raw: string): string => {
        let code = raw.trim();
        code = code.replace(/^```(?:html)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
        // Strip any leading text before <!DOCTYPE or <html
        const htmlStart = code.search(/<(!doctype|html)/i);
        if (htmlStart > 0) {
            code = code.substring(htmlStart);
        }
        return code.trim();
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;

        if (!user) {
            setShowAuthDialog(true);
            return;
        }

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: prompt,
            timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, userMessage]);

        const currentPrompt = prompt;
        setPrompt('');
        setIsGenerating(true);
        setActiveTab('preview');

        const agentSteps: AgentStep[] = [
            { id: 'analyze', label: 'Analyzing requirements', status: 'active' },
            { id: 'design', label: 'Designing layout & components', status: 'pending' },
            { id: 'generate', label: 'Generating code', status: 'pending' },
            { id: 'render', label: 'Rendering preview', status: 'pending' },
        ];
        setSteps(agentSteps);

        try {
            await puterService.initialize();

            await new Promise(r => setTimeout(r, 500));
            updateStep('analyze', { status: 'done' });
            updateStep('design', { status: 'active', detail: 'Structuring HTML, CSS, JS…' });

            await new Promise(r => setTimeout(r, 400));
            updateStep('design', { status: 'done' });
            updateStep('generate', { status: 'active', detail: 'Writing production code…' });

            const contextPrompt = chatMessages.length > 0 && generatedCode
                ? `Previous code context (modify this based on the new request):\n\n${generatedCode}\n\nNew request: ${currentPrompt}`
                : currentPrompt;

            const response = await (window as any).puter.ai.chat(contextPrompt, {
                model: 'google/gemini-2.5-flash',
                system: SYSTEM_PROMPT,
                stream: false,
                max_tokens: 16000,
                temperature: 0.4,
            });

            let code = '';
            if (response && typeof response === 'object' && response.message?.content) {
                code = response.message.content;
            } else if (typeof response === 'string') {
                code = response;
            } else if (response?.text) {
                code = response.text;
            }

            code = cleanCode(code);

            updateStep('generate', { status: 'done' });
            updateStep('render', { status: 'active', detail: 'Loading in preview…' });

            setGeneratedCode(code);

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: 'I\'ve generated the code and updated the preview. You can see the live result in the Preview tab or inspect the source in the Code tab.',
                timestamp: new Date(),
                isCode: true,
            };
            setChatMessages(prev => [...prev, assistantMessage]);

            await new Promise(r => setTimeout(r, 300));
            updateStep('render', { status: 'done' });
        } catch (error) {
            console.error('Code Agent error:', error);
            const errorStep = agentSteps.find(s => s.status === 'active') || agentSteps[agentSteps.length - 1];
            updateStep(errorStep.id, { status: 'error', detail: 'Failed — try again' });

            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                timestamp: new Date(),
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([generatedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-app.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const suggestedPrompts = [
        { icon: '🎨', label: 'Dashboard', prompt: 'Build a modern analytics dashboard with charts, stats cards, and a sidebar navigation' },
        { icon: '🛒', label: 'Landing Page', prompt: 'Create a SaaS landing page with hero section, features grid, pricing table, and testimonials' },
        { icon: '📋', label: 'Todo App', prompt: 'Build a beautiful task management app with categories, priorities, drag-and-drop, and a progress tracker' },
        { icon: '💬', label: 'Chat UI', prompt: 'Design a messaging interface like WhatsApp with contacts sidebar, message bubbles, and typing indicators' },
    ];

    return (
        <div className="flex flex-col h-screen bg-[#011023] overflow-hidden">
            {/* Top Bar */}
            <header className="flex items-center justify-between h-14 px-4 border-b border-[#052558]/80 bg-[#011023] z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/chat')}
                        className="text-[#7C9FC9] hover:text-[#C2E8FF] hover:bg-[#052558]/60 h-8 w-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="text-[#7C9FC9] hover:text-[#C2E8FF] hover:bg-[#052558]/60 h-8 w-8 rounded-md flex items-center justify-center transition-colors"
                    >
                        <LayoutPanelLeft className="w-4 h-4" />
                    </button>
                    <div className="h-5 w-px bg-[#052558]" />
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#527FB0] to-[#052558] flex items-center justify-center shadow-lg shadow-[#527FB0]/20">
                            <Code2 className="w-3.5 h-3.5 text-[#C2E8FF]" />
                        </div>
                        <span className="text-[#C2E8FF] font-semibold text-sm tracking-wide">Code Agent</span>
                        <span className="text-[#7C9FC9]/60 text-xs hidden sm:inline">by Cosmic AI</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {generatedCode && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                className="text-[#7C9FC9] hover:text-[#C2E8FF] hover:bg-[#052558]/60 h-8 text-xs gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" /> Export
                            </Button>
                            <div className="h-5 w-px bg-[#052558]" />
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setChatMessages([]);
                            setGeneratedCode('');
                            setSteps([]);
                            setPrompt('');
                        }}
                        className="text-[#7C9FC9] hover:text-[#C2E8FF] hover:bg-[#052558]/60 h-8 text-xs gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> New
                    </Button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel — Chat */}
                {showSidebar && (
                    <div className="w-[380px] min-w-[320px] flex flex-col border-r border-[#052558]/80 bg-[#011023]/50">
                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto">
                            {chatMessages.length === 0 ? (
                                /* Empty state with suggestions */
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#527FB0]/20 to-[#052558]/40 flex items-center justify-center mb-4 shadow-lg">
                                            <Sparkles className="w-7 h-7 text-[#527FB0]" />
                                        </div>
                                        <h3 className="text-[#C2E8FF] font-semibold text-base mb-1">What do you want to build?</h3>
                                        <p className="text-[#7C9FC9]/70 text-xs leading-relaxed max-w-[280px] mb-6">
                                            Describe any app, page, or component. I'll generate production-ready code with a live preview.
                                        </p>
                                        <div className="w-full space-y-2">
                                            {suggestedPrompts.map((sp) => (
                                                <button
                                                    key={sp.label}
                                                    onClick={() => { setPrompt(sp.prompt); textareaRef.current?.focus(); }}
                                                    className="w-full text-left px-4 py-3 rounded-xl bg-[#052558]/30 border border-[#052558]/60 hover:bg-[#052558]/50 hover:border-[#527FB0]/30 transition-all duration-200 group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{sp.icon}</span>
                                                        <div>
                                                            <div className="text-[#C2E8FF] text-sm font-medium group-hover:text-white transition-colors">{sp.label}</div>
                                                            <div className="text-[#7C9FC9]/60 text-xs line-clamp-1">{sp.prompt}</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Chat history */
                                <div className="p-4 space-y-4">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'assistant' && (
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#527FB0] to-[#052558] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                                                    <Bot className="w-3.5 h-3.5 text-[#C2E8FF]" />
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-[#527FB0] text-white rounded-br-md'
                                                : 'bg-[#052558]/60 text-[#C2E8FF] border border-[#052558] rounded-bl-md'
                                                }`}>
                                                {msg.content}
                                                {msg.isCode && (
                                                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10">
                                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                                        <span className="text-xs opacity-70">Preview updated</span>
                                                    </div>
                                                )}
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="w-7 h-7 rounded-lg bg-[#052558] flex items-center justify-center shrink-0 mt-0.5">
                                                    <User className="w-3.5 h-3.5 text-[#7C9FC9]" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Agent steps during generation */}
                                    {isGenerating && steps.length > 0 && (
                                        <div className="flex gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#527FB0] to-[#052558] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                                                <Bot className="w-3.5 h-3.5 text-[#C2E8FF]" />
                                            </div>
                                            <div className="bg-[#052558]/40 border border-[#052558] rounded-2xl rounded-bl-md px-3.5 py-3 space-y-2 max-w-[85%]">
                                                {steps.map((step) => (
                                                    <div key={step.id} className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${step.status === 'active' ? 'text-[#C2E8FF]' :
                                                        step.status === 'done' ? 'text-[#7C9FC9]/60' :
                                                            step.status === 'error' ? 'text-red-400' :
                                                                'text-[#7C9FC9]/30'
                                                        }`}>
                                                        {step.status === 'active' && <Loader2 className="w-3 h-3 animate-spin text-[#527FB0]" />}
                                                        {step.status === 'done' && <Check className="w-3 h-3 text-green-400" />}
                                                        {step.status === 'error' && <span className="text-red-400 font-bold text-xs">✕</span>}
                                                        {step.status === 'pending' && <div className="w-3 h-3 rounded-full border border-current opacity-30" />}
                                                        <span>{step.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div ref={chatEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input area */}
                        <div className="p-3 border-t border-[#052558]/80 bg-[#011023]/80 backdrop-blur-sm">
                            <div className="flex items-end gap-2 bg-[#052558]/40 border border-[#052558] rounded-xl p-2">
                                <Textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={chatMessages.length > 0 ? "Ask for changes…" : "Describe what you want to build…"}
                                    className="flex-1 min-h-[40px] max-h-[100px] bg-transparent border-0 text-[#C2E8FF] placeholder-[#7C9FC9]/40 resize-none focus:ring-0 focus:outline-none text-sm p-2"
                                    rows={1}
                                />
                                <Button
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim() || isGenerating}
                                    size="sm"
                                    className="shrink-0 w-8 h-8 p-0 rounded-lg bg-[#527FB0] hover:bg-[#7C9FC9] text-white disabled:bg-[#052558] disabled:text-[#7C9FC9]/30 transition-all duration-200"
                                >
                                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                            <p className="text-[#7C9FC9]/40 text-[10px] mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
                        </div>
                    </div>
                )}

                {/* Right Panel — Preview / Code */}
                <div className="flex-1 flex flex-col bg-[#011023] min-w-0">
                    {/* Tab Bar */}
                    <div className="flex items-center justify-between h-10 px-2 border-b border-[#052558]/80 bg-[#011023] shrink-0">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${activeTab === 'preview'
                                    ? 'bg-[#052558] text-[#C2E8FF] shadow-sm'
                                    : 'text-[#7C9FC9]/60 hover:text-[#C2E8FF] hover:bg-[#052558]/40'
                                    }`}
                            >
                                <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                            <button
                                onClick={() => setActiveTab('code')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${activeTab === 'code'
                                    ? 'bg-[#052558] text-[#C2E8FF] shadow-sm'
                                    : 'text-[#7C9FC9]/60 hover:text-[#C2E8FF] hover:bg-[#052558]/40'
                                    }`}
                            >
                                <FileCode className="w-3.5 h-3.5" /> Code
                            </button>
                            {generatedCode && (
                                <div className="flex items-center gap-1.5 ml-2 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-green-400 text-[10px] font-medium">Live</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            {generatedCode && activeTab === 'code' && (
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium text-[#7C9FC9]/60 hover:text-[#C2E8FF] hover:bg-[#052558]/40 transition-all"
                                >
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            )}
                            {generatedCode && activeTab === 'preview' && (
                                <button
                                    onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[#7C9FC9]/60 hover:text-[#C2E8FF] hover:bg-[#052558]/40 transition-all"
                                >
                                    {isPreviewFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'preview' && (
                            <div className="w-full h-full">
                                {generatedCode ? (
                                    <iframe
                                        ref={iframeRef}
                                        srcDoc={generatedCode}
                                        sandbox="allow-scripts allow-modals allow-forms"
                                        className="w-full h-full border-0 bg-white rounded-none"
                                        title="Live Preview"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#011023]">
                                        <div className="text-center max-w-md px-8">
                                            <div className="relative mx-auto mb-6 w-24 h-24">
                                                {/* Animated preview placeholder */}
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#052558]/40 to-[#052558]/20 border border-[#052558] flex items-center justify-center">
                                                    <div className="w-14 h-14 rounded-xl bg-[#052558]/60 border border-[#527FB0]/20 flex items-center justify-center">
                                                        <Terminal className="w-7 h-7 text-[#527FB0]/40" />
                                                    </div>
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#052558] border border-[#527FB0]/20 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-[#527FB0]/40 rounded-full" />
                                                </div>
                                            </div>
                                            <h3 className="text-[#C2E8FF]/80 font-medium text-sm mb-1.5">No preview yet</h3>
                                            <p className="text-[#7C9FC9]/40 text-xs leading-relaxed">
                                                Describe what you want to build in the chat and I'll generate a live preview here.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'code' && (
                            <div className="w-full h-full overflow-auto bg-[#0a1628]">
                                {generatedCode ? (
                                    <div className="relative">
                                        {/* Line numbers + code */}
                                        <pre className="p-4 text-[13px] font-mono leading-[1.6] whitespace-pre-wrap break-words">
                                            {generatedCode.split('\n').map((line, i) => (
                                                <div key={i} className="flex">
                                                    <span className="select-none text-[#7C9FC9]/20 w-12 text-right pr-4 shrink-0 text-xs leading-[1.6]">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-[#C2E8FF]/80 flex-1">{line || ' '}</span>
                                                </div>
                                            ))}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <p className="text-[#7C9FC9]/30 text-xs">Generated code will appear here</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
        </div>
    );
};

export default CodeAgent;
