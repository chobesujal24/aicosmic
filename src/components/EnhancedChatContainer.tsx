import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { EnhancedChatInput } from './EnhancedChatInput';
import { AuthDialog } from './AuthDialog';
import { useAuth } from '@/hooks/useAuth';
import {
  Sparkles,
  MessageSquare,
  Bot,
  Palette,
  Wand2,
  Image as ImageIcon
} from 'lucide-react';
import { puterService } from '../lib/puterService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
  type?: 'text' | 'image' | 'error';
  imageUrl?: string;
}

interface EnhancedChatContainerProps {
  currentChatId?: string;
  selectedModel?: string;
  onChatUpdate?: (chatId: string, title: string, messageCount: number) => void;
}

export function EnhancedChatContainer({ currentChatId, selectedModel = 'google/gemini-2.5-flash', onChatUpdate }: EnhancedChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(selectedModel);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { toast } = useToast();

  // Sync internal state with prop changes
  useEffect(() => {
    setCurrentModel(selectedModel);
  }, [selectedModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history when currentChatId changes
    const loadChatHistory = () => {
      if (!currentChatId) {
        setMessages([]);
        return;
      }

      try {
        const savedMessages = localStorage.getItem(`chat-messages-${currentChatId}`);
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setMessages([]);
      }
    };

    loadChatHistory();
  }, [currentChatId]);

  const saveChatHistory = (updatedMessages: Message[]) => {
    if (!currentChatId) return;

    try {
      // Save messages for this specific chat
      localStorage.setItem(`chat-messages-${currentChatId}`, JSON.stringify(updatedMessages));

      // Update chat sessions list
      const savedSessions = localStorage.getItem('chat-sessions');
      const sessions = savedSessions ? JSON.parse(savedSessions) : [];

      const sessionIndex = sessions.findIndex((s: any) => s.id === currentChatId);
      const sessionData = {
        id: currentChatId,
        title: updatedMessages[0]?.content.slice(0, 50) || 'New Chat',
        lastUpdated: new Date().toISOString(),
        messageCount: updatedMessages.length,
        model: currentModel
      };

      if (sessionIndex >= 0) {
        sessions[sessionIndex] = sessionData;
      } else {
        sessions.unshift(sessionData);
      }

      localStorage.setItem('chat-sessions', JSON.stringify(sessions));

      // Notify parent component
      if (onChatUpdate) {
        onChatUpdate(currentChatId, sessionData.title, updatedMessages.length);
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const handleSendMessage = async (messageText: string, files?: File[], mode?: 'thinking' | 'search' | 'normal') => {
    if (!messageText.trim() || isLoading) return;

    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText.trim(),
      sender: 'user',
      timestamp: new Date(),
      model: selectedModel
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await puterService.chat(userMessage.content, {
        model: currentModel,
        max_tokens: 1500, // Optimized for faster responses
        temperature: 0.7,
        memory: true
      }, sessionId);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date(),
        model: currentModel,
        type: 'text'
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      toast({
        title: "Message sent",
        description: "Response received successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'assistant',
        timestamp: new Date(),
        model: currentModel,
        type: 'error'
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateResponse = async (messageIndex: number) => {
    if (messageIndex <= 0 || isLoading) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.sender !== 'user') return;

    setIsLoading(true);

    try {
      const response = await puterService.chat(userMessage.content, {
        model: currentModel,
        max_tokens: 1500,
        temperature: 0.7,
        memory: true
      }, sessionId);

      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: response,
        timestamp: new Date(),
        model: currentModel,
        type: 'text'
      };

      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);

      toast({
        title: "Response regenerated",
        description: "New response generated successfully",
      });
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (currentChatId) {
      localStorage.removeItem(`chat-messages-${currentChatId}`);
    }
    toast({
      title: "Chat cleared",
      description: "All messages have been removed.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 px-4 pt-20 pb-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in px-4">
              <h3 className="text-4xl md:text-5xl font-medium text-white mb-2 tracking-tight">
                Hey! {user?.displayName ? user.displayName.split(' ')[0] : 'User'}
              </h3>
              <p className="text-[#9C9CCE] text-3xl md:text-4xl mb-12 max-w-2xl text-center">
                What can I help with?
              </p>

              <div className="flex flex-wrap justify-center gap-4 w-full max-w-3xl mx-auto">
                {/* Content Help Card */}
                <div
                  className="flex flex-col flex-1 min-w-[200px] p-4 bg-[#1C1A1E] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => handleSendMessage("Help with me create a Presentation")}
                >
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#E5F4F9] text-[#2A6E8A] text-sm font-medium w-fit mb-3">
                    Content Help
                  </div>
                  <span className="text-sm text-white/50 line-clamp-2">Help with me create a Presentation</span>
                </div>

                {/* Suggestions Card */}
                <div
                  className="flex flex-col flex-1 min-w-[200px] p-4 bg-[#1C1A1E] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => handleSendMessage("Help with me ideas")}
                >
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FCE8E8] text-[#9A5050] text-sm font-medium w-fit mb-3">
                    Suggestions
                  </div>
                  <span className="text-sm text-white/50 line-clamp-2">Help with me ideas</span>
                </div>

                {/* Job Application Card */}
                <div
                  className="flex flex-col flex-1 min-w-[200px] p-4 bg-[#1C1A1E] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => handleSendMessage("Help with me apply for job application")}
                >
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#E8F8E8] text-[#4A804A] text-sm font-medium w-fit mb-3">
                    Job Application
                  </div>
                  <span className="text-sm text-white/50 line-clamp-2">Help with me apply for job application</span>
                </div>
              </div>

              <div className="hidden">
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id}>
                <ChatMessage
                  message={message.content}
                  isUser={message.sender === 'user'}
                  timestamp={message.timestamp}
                  model={message.model}
                  onRegenerate={() => handleRegenerateResponse(index)}
                  showRegenerate={message.sender === 'assistant' && index === messages.length - 1}
                />
              </div>
            ))
          )}

          {isLoading && <div className="py-4"><TypingIndicator /></div>}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Enhanced Chat Input */}
      <div className="bg-transparent pb-4">
        <EnhancedChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}