// Enhanced Puter AI service with complete model support and optimized performance
export interface PuterAIOptions {
  model?: string;
  context?: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
  memory?: boolean;
  stream?: boolean;
}

export interface ChatMemory {
  messages: Array<{ role: string; content: string; timestamp: Date }>;
  model: string;
  sessionId: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: 'live' | 'beta' | 'error' | 'testing';
  description: string;
  maxTokens: number;
  costTier: 'free' | 'low' | 'medium' | 'high';
  responseTime?: number;
  lastTested?: Date;
  capabilities: string[];
}

export class PuterService {
  private static instance: PuterService;
  private chatMemory: Map<string, ChatMemory> = new Map();
  private isInitialized = false;
  private availableModels: Map<string, ModelInfo> = new Map();
  private modelTestResults: Map<string, { working: boolean; responseTime: number; lastTested: Date }> = new Map();
  private initializationPromise: Promise<boolean> | null = null;

  // Complete model definitions from Puter API (updated Feb 2026)
  private readonly MODEL_DEFINITIONS: ModelInfo[] = [
    // OpenAI Models
    {
      id: 'gpt-4.1',
      name: 'GPT-4.1',
      provider: 'OpenAI',
      category: 'Featured',
      status: 'live',
      description: 'Latest GPT model with advanced reasoning and code',
      maxTokens: 4000,
      costTier: 'medium',
      capabilities: ['text', 'vision', 'reasoning', 'code']
    },
    {
      id: 'gpt-4.1-mini',
      name: 'GPT-4.1 Mini',
      provider: 'OpenAI',
      category: 'Fast',
      status: 'live',
      description: 'Lightweight GPT-4.1 for quick responses',
      maxTokens: 2000,
      costTier: 'free',
      capabilities: ['text', 'vision', 'code']
    },
    {
      id: 'gpt-4.1-nano',
      name: 'GPT-4.1 Nano',
      provider: 'OpenAI',
      category: 'Fast',
      status: 'live',
      description: 'Ultra-fast nano variant of GPT-4.1',
      maxTokens: 2000,
      costTier: 'free',
      capabilities: ['text', 'code']
    },
    {
      id: 'gpt-5-nano',
      name: 'GPT-5 Nano',
      provider: 'OpenAI',
      category: 'Featured',
      status: 'live',
      description: 'Next-gen GPT-5 nano variant — fast and capable',
      maxTokens: 4000,
      costTier: 'low',
      capabilities: ['text', 'reasoning', 'code']
    },
    {
      id: 'openai/o4-mini',
      name: 'o4 Mini',
      provider: 'OpenAI',
      category: 'Reasoning',
      status: 'live',
      description: 'Compact reasoning model for problem-solving',
      maxTokens: 8000,
      costTier: 'medium',
      capabilities: ['reasoning', 'math', 'science', 'code']
    },

    // Anthropic Models
    {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'Anthropic',
      category: 'Featured',
      status: 'live',
      description: 'Enhanced steerability and coding (72.7% SWE-bench)',
      maxTokens: 4000,
      costTier: 'medium',
      capabilities: ['text', 'reasoning', 'writing', 'code', 'analysis']
    },
    {
      id: 'anthropic/claude-opus-4',
      name: 'Claude Opus 4',
      provider: 'Anthropic',
      category: 'Advanced',
      status: 'live',
      description: 'Flagship model for complex long-running tasks (72.5% SWE-bench)',
      maxTokens: 8000,
      costTier: 'high',
      capabilities: ['text', 'reasoning', 'writing', 'analysis', 'research', 'code']
    },
    {
      id: 'anthropic/claude-haiku-4.5',
      name: 'Claude Haiku 4.5',
      provider: 'Anthropic',
      category: 'Fast',
      status: 'live',
      description: 'Fastest Claude model with enhanced capabilities',
      maxTokens: 2000,
      costTier: 'low',
      capabilities: ['text', 'writing', 'code']
    },

    // DeepSeek Models
    {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek V3',
      provider: 'DeepSeek',
      category: 'Featured',
      status: 'live',
      description: 'First open-source model to outperform all proprietary non-reasoning models',
      maxTokens: 4000,
      costTier: 'low',
      capabilities: ['text', 'reasoning', 'code']
    },
    {
      id: 'deepseek/deepseek-r1-0528',
      name: 'DeepSeek R1 0528',
      provider: 'DeepSeek',
      category: 'Reasoning',
      status: 'live',
      description: 'May 2025 update — approaching O3 and Gemini 2.5 Pro performance',
      maxTokens: 8000,
      costTier: 'medium',
      capabilities: ['reasoning', 'math', 'science', 'code', 'analysis']
    },

    // Google Models
    {
      id: 'google/gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'Google',
      category: 'Featured',
      status: 'live',
      description: 'Hybrid reasoning model balancing speed, cost, and intelligence',
      maxTokens: 4000,
      costTier: 'low',
      capabilities: ['text', 'vision', 'code', 'reasoning', 'multimodal']
    },
    {
      id: 'google/gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'Google',
      category: 'Advanced',
      status: 'live',
      description: 'Most capable reasoning model with 1M token context window',
      maxTokens: 8000,
      costTier: 'medium',
      capabilities: ['text', 'vision', 'reasoning', 'code', 'multimodal']
    },
    {
      id: 'google/gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      provider: 'Google',
      category: 'Fast',
      status: 'live',
      description: 'Ultra-fast and cost-efficient Gemini variant',
      maxTokens: 2000,
      costTier: 'free',
      capabilities: ['text', 'vision', 'code']
    },

    // Meta Models
    {
      id: 'meta-llama/llama-4-maverick',
      name: 'Llama 4 Maverick',
      provider: 'Meta',
      category: 'Advanced',
      status: 'live',
      description: 'Latest Llama 4 with exceptional multilingual capabilities',
      maxTokens: 4000,
      costTier: 'low',
      capabilities: ['text', 'reasoning', 'code', 'multilingual']
    },
    {
      id: 'meta-llama/llama-4-scout',
      name: 'Llama 4 Scout',
      provider: 'Meta',
      category: 'Fast',
      status: 'live',
      description: 'Efficient Llama 4 model for quick tasks',
      maxTokens: 2000,
      costTier: 'free',
      capabilities: ['text', 'code']
    },

    // Mistral Models
    {
      id: 'mistralai/mistral-medium-3',
      name: 'Mistral Medium 3',
      provider: 'Mistral',
      category: 'Advanced',
      status: 'live',
      description: 'Mistral\'s capable model for complex tasks',
      maxTokens: 4000,
      costTier: 'medium',
      capabilities: ['text', 'reasoning', 'code', 'multilingual']
    },
    {
      id: 'mistralai/devstral-small',
      name: 'Devstral Small',
      provider: 'Mistral',
      category: 'Code',
      status: 'live',
      description: '24B agentic LLM for software engineering (46.8% SWE-Bench)',
      maxTokens: 4000,
      costTier: 'low',
      capabilities: ['code', 'programming', 'debugging']
    },
    {
      id: 'mistralai/mistral-small-3.1',
      name: 'Mistral Small 3.1',
      provider: 'Mistral',
      category: 'Fast',
      status: 'live',
      description: 'Efficient model for quick responses',
      maxTokens: 2000,
      costTier: 'free',
      capabilities: ['text', 'code']
    },

    // xAI Models
    {
      id: 'x-ai/grok-3-beta',
      name: 'Grok 3',
      provider: 'xAI',
      category: 'Advanced',
      status: 'live',
      description: 'xAI\'s most capable model with real-time knowledge',
      maxTokens: 4000,
      costTier: 'medium',
      capabilities: ['text', 'reasoning', 'code', 'analysis']
    },
    {
      id: 'x-ai/grok-3-mini-beta',
      name: 'Grok 3 Mini',
      provider: 'xAI',
      category: 'Fast',
      status: 'live',
      description: 'Lightweight Grok model for quick responses',
      maxTokens: 2000,
      costTier: 'low',
      capabilities: ['text', 'code']
    }
  ];

  static getInstance(): PuterService {
    if (!PuterService.instance) {
      PuterService.instance = new PuterService();
    }
    return PuterService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Puter SDK...');

      // Initialize model definitions first
      this.initializeModelDefinitions();

      // Wait for Puter SDK with optimized timeout
      let attempts = 0;
      const maxAttempts = 20; // Reduced for faster initialization

      while (attempts < maxAttempts) {
        if (typeof (window as any).puter !== 'undefined' &&
          typeof (window as any).puter.ai !== 'undefined') {
          this.isInitialized = true;
          console.log('✅ Puter SDK initialized successfully');
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      console.warn('⚠️ Puter SDK not available after timeout, using fallback mode');
      return false;
    } catch (error) {
      console.error('❌ Error initializing Puter SDK:', error);
      return false;
    }
  }

  private initializeModelDefinitions(): void {
    // Initialize all models with default status
    this.MODEL_DEFINITIONS.forEach(model => {
      this.availableModels.set(model.id, { ...model });
    });
    console.log(`📋 Initialized ${this.MODEL_DEFINITIONS.length} model definitions`);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      return typeof (window as any).puter !== 'undefined' &&
        typeof (window as any).puter.ai !== 'undefined';
    } catch (error) {
      console.error('Error checking Puter availability:', error);
      return false;
    }
  }

  // Optimized memory management
  addToMemory(sessionId: string, role: string, content: string, model: string) {
    const memoryKey = `${sessionId}-${model}`;

    if (!this.chatMemory.has(memoryKey)) {
      this.chatMemory.set(memoryKey, {
        messages: [],
        model: model,
        sessionId: sessionId
      });
    }

    const memory = this.chatMemory.get(memoryKey)!;
    memory.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    // Keep last 10 messages for optimal performance
    if (memory.messages.length > 10) {
      memory.messages = memory.messages.slice(-10);
    }

    // Debounced save to localStorage
    this.debouncedSaveMemory(memoryKey, memory);
  }

  private saveTimeouts: Map<string, NodeJS.Timeout> = new Map();

  private debouncedSaveMemory(memoryKey: string, memory: ChatMemory) {
    const existingTimeout = this.saveTimeouts.get(memoryKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(`chat-memory-${memoryKey}`, JSON.stringify(memory));
        this.saveTimeouts.delete(memoryKey);
      } catch (error) {
        console.warn('Failed to save memory to localStorage:', error);
      }
    }, 300); // Reduced debounce time

    this.saveTimeouts.set(memoryKey, timeout);
  }

  getMemory(sessionId: string, model: string): Array<{ role: string; content: string }> {
    const memoryKey = `${sessionId}-${model}`;

    // Try to load from localStorage first
    try {
      const saved = localStorage.getItem(`chat-memory-${memoryKey}`);
      if (saved) {
        const memory = JSON.parse(saved);
        this.chatMemory.set(memoryKey, memory);
        return memory.messages.map((m: any) => ({ role: m.role, content: m.content }));
      }
    } catch (error) {
      console.warn('Failed to load memory from localStorage:', error);
    }

    const memory = this.chatMemory.get(memoryKey);
    return memory ? memory.messages.map(m => ({ role: m.role, content: m.content })) : [];
  }

  clearMemory(sessionId: string, model?: string) {
    if (model) {
      const memoryKey = `${sessionId}-${model}`;
      this.chatMemory.delete(memoryKey);
      try {
        localStorage.removeItem(`chat-memory-${memoryKey}`);
      } catch (error) {
        console.warn('Failed to clear memory from localStorage:', error);
      }
    } else {
      const keysToDelete = Array.from(this.chatMemory.keys()).filter(key => key.startsWith(sessionId));
      keysToDelete.forEach(key => {
        this.chatMemory.delete(key);
        try {
          localStorage.removeItem(`chat-memory-${key}`);
        } catch (error) {
          console.warn('Failed to clear memory from localStorage:', error);
        }
      });
    }
  }

  async chat(message: string, options: PuterAIOptions = {}, sessionId?: string): Promise<string> {
    const startTime = Date.now();

    if (!await this.isAvailable()) {
      console.log('🔄 Puter SDK not available, using enhanced fallback');
      return this.getEnhancedFallbackResponse(message, options.model);
    }

    const defaultOptions: PuterAIOptions = {
      model: 'google/gemini-2.5-flash',
      max_tokens: 1000, // Reduced for faster responses
      temperature: 0.7,
      memory: true,
      stream: true,
      ...options
    };

    try {
      console.log(`🚀 Sending to ${defaultOptions.model}:`, message.slice(0, 50) + '...');

      // Build optimized conversation context
      let conversationMessages: Array<{ role: string; content: string }> = [];

      if (defaultOptions.memory && sessionId && defaultOptions.model) {
        const memory = this.getMemory(sessionId, defaultOptions.model);
        // Use only last 4 messages for faster processing
        conversationMessages = [...memory.slice(-4)];
      }

      // Add current message
      conversationMessages.push({ role: 'user', content: message });

      const puterModel = defaultOptions.model!;
      let response;

      // Optimized API call with shorter timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
      });

      const apiCall = async () => {
        const chatOptions = {
          model: puterModel,
          max_tokens: defaultOptions.max_tokens,
          temperature: defaultOptions.temperature,
          stream: defaultOptions.stream
        };

        if (conversationMessages.length > 1) {
          const response = await (window as any).puter.ai.chat(conversationMessages, chatOptions);
          return defaultOptions.stream ? await this.handleStreamResponse(response) : response;
        } else {
          const response = await (window as any).puter.ai.chat(message, chatOptions);
          return defaultOptions.stream ? await this.handleStreamResponse(response) : response;
        }
      };

      response = await Promise.race([apiCall(), timeoutPromise]);

      const responseTime = Date.now() - startTime;
      console.log(`⚡ Response received in ${responseTime}ms`);

      // Update model performance metrics
      this.updateModelMetrics(defaultOptions.model!, responseTime, true);

      const responseText = this.extractResponseText(response);

      if (!responseText || responseText.length < 3) {
        throw new Error('Empty or invalid response received');
      }

      // Add to memory if enabled
      if (defaultOptions.memory && sessionId && defaultOptions.model) {
        this.addToMemory(sessionId, 'user', message, defaultOptions.model);
        this.addToMemory(sessionId, 'assistant', responseText, defaultOptions.model);
      }

      return responseText;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Chat error after ${responseTime}ms:`, error);

      // Update model metrics for failed requests
      this.updateModelMetrics(defaultOptions.model!, responseTime, false);

      return this.getEnhancedFallbackResponse(message, defaultOptions.model, error);
    }
  }

  private async handleStreamResponse(response: any): Promise<string> {
    try {
      // Check if response is an async iterable (stream)
      if (response && typeof response[Symbol.asyncIterator] === 'function') {
        let fullResponse = '';

        for await (const chunk of response) {
          if (typeof chunk === 'string') {
            fullResponse += chunk;
          } else if (chunk && typeof chunk === 'object') {
            // Handle different chunk formats
            const chunkText = chunk.content || chunk.text || chunk.message || chunk.delta?.content || '';
            if (typeof chunkText === 'string') {
              fullResponse += chunkText;
            }
          }
        }

        return fullResponse.trim();
      }

      // If not a stream, return as regular response
      return this.extractResponseText(response);
    } catch (error) {
      console.error('Stream handling error:', error);
      // Fallback to regular response extraction
      return this.extractResponseText(response);
    }
  }

  private updateModelMetrics(modelId: string, responseTime: number, success: boolean) {
    const model = this.availableModels.get(modelId);
    if (model) {
      model.responseTime = responseTime;
      model.lastTested = new Date();

      if (success) {
        model.status = responseTime < 5000 ? 'live' : 'beta';
      } else {
        model.status = 'error';
      }
    }

    this.modelTestResults.set(modelId, {
      working: success,
      responseTime,
      lastTested: new Date()
    });
  }

  async imageToText(imageUrl: string, prompt?: string, sessionId?: string): Promise<string> {
    if (!await this.isAvailable()) {
      return 'Image processing service not available. Please ensure the Puter SDK is loaded and try again.';
    }

    try {
      console.log('🖼️ Processing image with Puter AI');
      const startTime = Date.now();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Image processing timeout after 15 seconds')), 15000);
      });

      const imageCall = async () => {
        return await (window as any).puter.ai.chat(
          prompt || 'Describe this image in detail',
          imageUrl,
          false,
          { model: 'gpt-4.1', max_tokens: 600, stream: false }
        );
      };

      const response = await Promise.race([imageCall(), timeoutPromise]);

      const responseTime = Date.now() - startTime;
      console.log(`🖼️ Image processed in ${responseTime}ms`);

      const responseText = this.extractResponseText(response);

      if (sessionId) {
        this.addToMemory(sessionId, 'user', `[Image Analysis] ${prompt || 'Describe this image'}`, 'gpt-4o');
        this.addToMemory(sessionId, 'assistant', responseText, 'gpt-4o');
      }

      return responseText;
    } catch (error) {
      console.error('🖼️ Image processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `I apologize, but I'm unable to process the image at the moment. Error: ${errorMessage}`;
    }
  }

  async generateImage(prompt: string, options: {
    model?: string;
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    sessionId?: string;
    testMode?: boolean;
  } = {}): Promise<{ imageUrl?: string; error?: string }> {
    if (!await this.isAvailable()) {
      return { error: 'Image generation service not available. Please ensure the Puter SDK is loaded and try again.' };
    }

    try {
      console.log('🎨 Generating image with DALL-E:', prompt.slice(0, 50) + '...');
      const startTime = Date.now();

      const testMode = options.testMode !== undefined ? options.testMode : false;

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Image generation timeout after 25 seconds')), 25000);
      });

      const imageCall = async () => {
        return await (window as any).puter.ai.txt2img(prompt, testMode);
      };

      const imageElement = await Promise.race([imageCall(), timeoutPromise]);

      if (!imageElement || !imageElement.src) {
        throw new Error('No image element received from DALL-E API');
      }

      const responseTime = Date.now() - startTime;
      console.log(`🎨 Image generated in ${responseTime}ms`);

      const imageUrl = imageElement.src;

      if (options.sessionId) {
        this.addToMemory(options.sessionId, 'user', `[Image Generation] ${prompt}`, 'dall-e');
        this.addToMemory(options.sessionId, 'assistant', `Generated image: ${imageUrl}`, 'dall-e');
      }

      return { imageUrl };

    } catch (error) {
      console.error('🎨 Image generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        error: `Failed to generate image: ${errorMessage}`
      };
    }
  }

  private getEnhancedFallbackResponse(message: string, model?: string, error?: any): string {
    const modelInfo = model ? this.getModelInfo(model) : null;
    const modelName = modelInfo ? modelInfo.name : 'AI Assistant';

    if (message.toLowerCase().includes('code') || message.toLowerCase().includes('program')) {
      return `I'd be happy to help with coding! However, I'm currently experiencing connectivity issues with the ${modelName} service.

Quick Coding Tips:
1. For debugging: Check syntax, indentation, and variable names
2. For new projects: Start with a basic structure and build incrementally
3. For algorithms: Break down the problem into smaller steps

Please try again in a moment when the connection is restored.`;
    }

    const fallbackResponses = [
      `Hello! I'm ${modelName} and I'd love to help with your question. However, I'm currently experiencing connectivity issues. Please try again in a moment!`,

      `Your message has been received! Unfortunately, there seems to be a temporary service issue with ${modelName}. I'm working to get back online shortly.`,

      `${modelName} here! I see your question and want to help, but I'm experiencing some technical difficulties. Please try again in a few moments.`,
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  private extractResponseText(response: any): string {
    if (typeof response === 'string' && response.trim()) {
      return response.trim();
    }

    if (response && typeof response === 'object') {
      const possiblePaths = [
        response.message?.content,
        response.message?.content?.[0]?.text,
        response.text,
        response.content,
        response.message,
        response.data,
        response.choices?.[0]?.message?.content,
        response.response,
        response.output,
        response.result
      ];

      for (const text of possiblePaths) {
        if (typeof text === 'string' && text.trim()) {
          return text.trim();
        }
      }
    }

    if (response === null || response === undefined) {
      return 'No response received from AI service. Please try again.';
    }

    const stringResponse = String(response);
    if (!stringResponse || stringResponse === 'undefined' || stringResponse === 'null') {
      return 'Invalid response format from AI service. Please try again.';
    }

    return stringResponse;
  }

  // Enhanced model management
  getAvailableModels(): ModelInfo[] {
    return Array.from(this.availableModels.values());
  }

  getModelsByCategory(): Record<string, ModelInfo[]> {
    const models = this.getAvailableModels();
    const categories: Record<string, ModelInfo[]> = {};

    models.forEach(model => {
      if (!categories[model.category]) {
        categories[model.category] = [];
      }
      categories[model.category].push(model);
    });

    // Sort categories by priority
    const categoryOrder = ['Featured', 'Reasoning', 'Advanced', 'Code', 'Vision', 'Fast', 'Next-Gen'];
    const sortedCategories: Record<string, ModelInfo[]> = {};

    categoryOrder.forEach(category => {
      if (categories[category]) {
        sortedCategories[category] = categories[category].sort((a, b) => {
          // Sort by status (live first), then by response time
          if (a.status !== b.status) {
            const statusOrder = { live: 0, beta: 1, testing: 2, error: 3 };
            return statusOrder[a.status] - statusOrder[b.status];
          }
          return (a.responseTime || 999999) - (b.responseTime || 999999);
        });
      }
    });

    return sortedCategories;
  }

  getModelInfo(modelId: string): ModelInfo | undefined {
    return this.availableModels.get(modelId);
  }

  isModelWorking(modelId: string): boolean {
    const result = this.modelTestResults.get(modelId);
    return result?.working === true;
  }

  getWorkingModels(): ModelInfo[] {
    return this.getAvailableModels().filter(model =>
      this.isModelWorking(model.id) || model.status === 'live'
    );
  }

  getModelPerformance(modelId: string): { responseTime?: number; lastTested?: Date; working: boolean } {
    const result = this.modelTestResults.get(modelId);
    return {
      responseTime: result?.responseTime,
      lastTested: result?.lastTested,
      working: result?.working || false
    };
  }

  // Get recommended model based on task
  getRecommendedModel(task: 'chat' | 'code' | 'reasoning' | 'fast' | 'vision'): string {
    const recommendations = {
      chat: 'deepseek-chat',
      code: 'codestral',
      reasoning: 'deepseek-reasoner',
      fast: 'gpt-4o-mini',
      vision: 'gpt-4o'
    };

    const recommended = recommendations[task];
    return this.isModelWorking(recommended) ? recommended : 'deepseek-chat';
  }

  // Get fastest working model
  getFastestModel(): string {
    const workingModels = this.getWorkingModels();
    if (workingModels.length === 0) return 'deepseek-chat';

    const sortedBySpeed = workingModels.sort((a, b) =>
      (a.responseTime || 999999) - (b.responseTime || 999999)
    );

    return sortedBySpeed[0].id;
  }
}

export const puterService = PuterService.getInstance();