import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Sparkles, Brain, Code, Zap, Eye, Rocket } from "lucide-react";
import { puterService, ModelInfo } from "@/lib/puterService";

// Updated models from Puter.com API (Feb 2026)
export const models = [
    // OpenAI Models
    { id: "gpt-4.1", name: "GPT-4.1", provider: "OpenAI", category: "Featured" },
    { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "OpenAI", category: "Fast" },
    { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", provider: "OpenAI", category: "Fast" },
    { id: "gpt-5-nano", name: "GPT-5 Nano", provider: "OpenAI", category: "Featured" },
    { id: "openai/o4-mini", name: "o4 Mini", provider: "OpenAI", category: "Reasoning" },

    // Anthropic Models
    { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", category: "Featured" },
    { id: "anthropic/claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", category: "Advanced" },
    { id: "anthropic/claude-haiku-4.5", name: "Claude Haiku 4.5", provider: "Anthropic", category: "Fast" },

    // DeepSeek Models
    { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "DeepSeek", category: "Featured" },
    { id: "deepseek/deepseek-r1-0528", name: "DeepSeek R1 0528", provider: "DeepSeek", category: "Reasoning" },

    // Google Models
    { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", category: "Featured" },
    { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", category: "Advanced" },
    { id: "google/gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", provider: "Google", category: "Fast" },

    // Meta Models
    { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", provider: "Meta", category: "Advanced" },
    { id: "meta-llama/llama-4-scout", name: "Llama 4 Scout", provider: "Meta", category: "Fast" },

    // Mistral Models
    { id: "mistralai/mistral-medium-3", name: "Mistral Medium 3", provider: "Mistral", category: "Advanced" },
    { id: "mistralai/devstral-small", name: "Devstral Small", provider: "Mistral", category: "Code" },
    { id: "mistralai/mistral-small-3.1", name: "Mistral Small 3.1", provider: "Mistral", category: "Fast" },

    // xAI Models
    { id: "x-ai/grok-3-beta", name: "Grok 3", provider: "xAI", category: "Advanced" },
    { id: "x-ai/grok-3-mini-beta", name: "Grok 3 Mini", provider: "xAI", category: "Fast" },
];

interface ModelMenuProps {
    selectedModel: string;
    onSelectModel: (modelId: string) => void;
}

export const ModelMenu = ({ selectedModel, onSelectModel }: ModelMenuProps) => {
    const selectedModelData = models.find((m) => m.id === selectedModel);
    const selectedModelName = selectedModelData?.name || "Select Model";

    // Group models by category
    const modelsByCategory = models.reduce((acc, model) => {
        if (!acc[model.category]) {
            acc[model.category] = [];
        }
        acc[model.category].push(model);
        return acc;
    }, {} as Record<string, typeof models>);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-3 min-w-[200px] justify-between bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white transition-all duration-200"
                >
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedModelName}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-neutral-400 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-80 max-h-96 overflow-y-auto bg-neutral-900 border-neutral-800 text-white"
                align="start"
            >
                {Object.entries(modelsByCategory).map(([category, categoryModels]) => (
                    <div key={category}>
                        <DropdownMenuLabel className="text-neutral-500 font-semibold px-2 py-1">
                            {category}
                        </DropdownMenuLabel>
                        {categoryModels.map((model) => {
                            const modelInfo = puterService.getModelInfo(model.id);
                            const performance = puterService.getModelPerformance(model.id);

                            return (
                                <DropdownMenuItem
                                    key={model.id}
                                    onSelect={() => onSelectModel(model.id)}
                                    className="flex items-center justify-between p-2 mx-1 rounded-md hover:bg-neutral-800 focus:bg-neutral-800 transition-colors cursor-pointer group"
                                >
                                    <div className="flex flex-col gap-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-neutral-200 group-hover:text-white transition-colors">
                                                {model.name}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700 font-normal px-1.5 py-0"
                                            >
                                                {model.provider}
                                            </Badge>
                                        </div>
                                    </div>
                                    {selectedModel === model.id && (
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                        <DropdownMenuSeparator className="bg-neutral-800" />
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};