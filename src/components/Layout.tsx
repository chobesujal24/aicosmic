import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { EnhancedChatContainer } from "./EnhancedChatContainer";
import { SettingsDialog } from "./SettingsDialog";
import { Button } from "@/components/ui/button";
import { Settings, Sparkles, Zap, Brain, Code, Rocket, Eye, Globe, Cpu, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { puterService, ModelInfo } from "../lib/puterService";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserMenu } from "./UserMenu";

export function Layout() {
  const [currentChatId, setCurrentChatId] = useState<string>();
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash');
  const [darkMode, setDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modelCategories, setModelCategories] = useState<Record<string, ModelInfo[]>>({});
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  useEffect(() => {
    // Initialize Puter service and load models
    const initializeModels = async () => {
      setIsLoadingModels(true);
      try {
        console.log('🔄 Initializing AI models...');
        await puterService.initialize();

        // Get models by category
        const categories = puterService.getModelsByCategory();
        setModelCategories(categories);

        // Set default model to fastest working model
        const fastestModel = puterService.getFastestModel();
        setSelectedModel(fastestModel);

        console.log('✅ Models loaded successfully');
        toast({
          title: "AI Models Ready",
          description: `${Object.keys(categories).length} model categories loaded`,
        });
      } catch (error) {
        console.error('❌ Failed to initialize models:', error);
        toast({
          title: "Model Loading Error",
          description: "Some AI models may not be available. Using fallback mode.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingModels(false);
      }
    };

    initializeModels();
  }, [toast]);
  // FIXED: New Chat Handler - Creates proper unique ID and triggers chat container update
  const handleNewChat = () => {
    const newChatId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('Layout: Creating new chat with ID:', newChatId);
    setCurrentChatId(newChatId);

    // Clear any existing chat state
    localStorage.removeItem(`chat-messages-${currentChatId}`);

    // Trigger a page refresh for the chat container to reset
    window.dispatchEvent(new CustomEvent('newChatCreated', { detail: { chatId: newChatId } }));
  };

  const handleLoadChat = (chatId: string) => {
    console.log('Layout: Loading chat with ID:', chatId);
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    try {
      // Remove from chat sessions
      const savedChats = localStorage.getItem('chat-sessions');
      if (savedChats) {
        const sessions = JSON.parse(savedChats);
        const filteredSessions = sessions.filter((s: any) => s.id !== chatId);
        localStorage.setItem('chat-sessions', JSON.stringify(filteredSessions));
      }

      // Remove from chat history
      const savedHistory = localStorage.getItem('chat-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const filteredHistory = history.filter((h: any) => h.id !== chatId);
        localStorage.setItem('chat-history', JSON.stringify(filteredHistory));
      }

      // Remove chat messages
      localStorage.removeItem(`chat-messages-${chatId}`);

      // If current chat is being deleted, start a new chat
      if (currentChatId === chatId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleToggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleChatUpdate = (chatId: string, title: string, messageCount: number) => {
    console.log('Chat updated:', { chatId, title, messageCount });
  };

  const getModelBadgeColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'beta': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'testing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Featured': return <Sparkles className="w-4 h-4 text-blue-400" />;
      case 'Reasoning': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'Advanced': return <Rocket className="w-4 h-4 text-orange-400" />;
      case 'Code': return <Code className="w-4 h-4 text-green-400" />;
      case 'Fast': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Vision': return <Eye className="w-4 h-4 text-pink-400" />;
      case 'Next-Gen': return <Cpu className="w-4 h-4 text-cyan-400" />;
      default: return <Globe className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'OpenAI': return 'text-green-400';
      case 'Anthropic': return 'text-orange-400';
      case 'DeepSeek': return 'text-blue-400';
      case 'Google': return 'text-red-400';
      case 'Meta': return 'text-purple-400';
      case 'Mistral': return 'text-yellow-400';
      case 'Microsoft': return 'text-cyan-400';
      case 'Community': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'beta': return <Clock className="w-3 h-3 text-yellow-400" />;
      case 'testing': return <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-400" />;
      default: return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const formatResponseTime = (time?: number) => {
    if (!time) return '';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  // Enhanced Models Menu Component (LibreChat Style)
  const ModelsMenu = ({ selectedModel, onModelChange }: { selectedModel: string; onModelChange: (model: string) => void }) => {
    const selectedModelInfo = puterService.getModelInfo(selectedModel);

    return (
      <Select value={selectedModel} onValueChange={onModelChange} open={modelMenuOpen} onOpenChange={setModelMenuOpen}>
        <SelectTrigger className="w-auto border-0 shadow-none bg-transparent hover:bg-white/5 data-[state=open]:bg-white/5 focus:ring-0 text-white/90 text-xl font-medium tracking-tight px-3 py-2 rounded-xl h-auto transition-colors">
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[200px] sm:max-w-xs">
              {isLoadingModels ? "Loading models..." : (selectedModelInfo?.name || "Select Model")}
            </span>
            <span className="text-white/50 text-base mt-0.5">▾</span>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#1C1F23] border border-white/10 text-white shadow-2xl rounded-2xl w-72 max-h-[60vh] overflow-y-auto">
          {isLoadingModels ? (
            <div className="p-4 text-center">
              <RefreshCw className="w-5 h-5 text-white/50 animate-spin mx-auto mb-2" />
              <p className="text-white/50 text-sm">Loading AI models...</p>
            </div>
          ) : Object.entries(modelCategories).map(([category, models]) => (
            <div key={category} className="mb-2 last:mb-0">
              <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-widest sticky top-0 bg-[#1C1F23]/95 backdrop-blur-sm z-10 flex items-center justify-between">
                <span>{category}</span>
              </div>
              <div className="p-1">
                {models.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    className="flex flex-col items-start px-3 py-2.5 rounded-xl text-white/90 focus:bg-white/10 focus:text-white cursor-pointer data-[state=checked]:bg-[#0AB2F4]/10 data-[state=checked]:text-[#0AB2F4]"
                  >
                    <div className="font-medium text-sm flex items-center gap-2">
                      {model.name}
                      {model.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Operational"></span>}
                      {model.status === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Issues detected"></span>}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">{model.provider}</div>
                  </SelectItem>
                ))}
              </div>
            </div>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        {/* UPDATED: Sidebar with New Conversation button moved inside */}
        <div className="hidden lg:block">
          <AppSidebar
            onNewChat={handleNewChat}
            onLoadChat={handleLoadChat}
            onDeleteChat={handleDeleteChat}
            currentChatId={currentChatId}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <AppSidebar
            onNewChat={handleNewChat}
            onLoadChat={handleLoadChat}
            onDeleteChat={handleDeleteChat}
            currentChatId={currentChatId}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        </div>

        {/* UPDATED: Full-width chat container with models menu positioned beside sidebar */}
        <div className="flex-1 flex flex-col h-screen relative">
          {/* Simplified Top-Left Model Selector */}
          <div className="absolute top-2 left-2 lg:left-4 z-30 flex items-center lg:top-4">
            {/* Mobile Sidebar Trigger */}
            <div className="lg:hidden mr-2">
              <SidebarTrigger className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/5 transition-colors" />
            </div>

            {/* Model Selector Button */}
            <ModelsMenu selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>

          {/* Top Right User Menu */}
          <div className="absolute top-4 right-4 lg:right-6 z-30 flex items-center animate-fade-in">
            <UserMenu />
          </div>

          {/* UPDATED: Main Content - Full Screen Chat (no header constraints) */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full">
              <EnhancedChatContainer
                currentChatId={currentChatId}
                selectedModel={selectedModel}
                onChatUpdate={handleChatUpdate}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </SidebarProvider>
  );
}