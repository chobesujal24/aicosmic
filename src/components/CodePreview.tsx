import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Play, Download, Eye, Code, Maximize2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface CodePreviewProps {
  code: string;
  language: string;
  title?: string;
  description?: string;
  isExecutable?: boolean;
}

export const CodePreview = ({
  code,
  language,
  title = "Code Preview",
  description,
  isExecutable = false
}: CodePreviewProps) => {
  const [activeTab, setActiveTab] = useState("code");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copied",
        description: "Code has been copied to clipboard."
      });
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const runCode = async () => {
    if (!isExecutable) return;

    setIsRunning(true);
    setActiveTab("output");

    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (language === 'javascript') {
        setOutput(`// Executing JavaScript code...\n\n${code}\n\n// Output:\nCode executed successfully!`);
      } else if (language === 'html') {
        setOutput(`<!-- HTML Preview -->\n${code}`);
      } else {
        setOutput(`Code execution completed for ${language}.\nThis is a simulated output.`);
      }
    } catch (error) {
      setOutput(`Error executing code: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Code downloaded",
      description: `File saved as code.${getFileExtension(language)}`
    });
  };

  const getFileExtension = (lang: string) => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      jsx: 'jsx',
      tsx: 'tsx'
    };
    return extensions[lang] || 'txt';
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      html: 'bg-orange-500',
      css: 'bg-purple-500',
      json: 'bg-gray-500',
      jsx: 'bg-cyan-500',
      tsx: 'bg-indigo-500',
      markdown: 'bg-slate-500',
      md: 'bg-slate-500'
    };
    return colors[lang] || 'bg-gray-500';
  };

  return (
    <Card className="w-full shadow-2xl border border-white/10 bg-[#0d1117] text-white overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161b22]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity mr-1">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="font-mono text-sm font-medium text-white/90 flex items-center gap-3">
                {title}
                <Badge className={`${getLanguageColor(language)} text-white border-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md`}>
                  {language.toUpperCase()}
                </Badge>
              </h3>
              {description && (
                <p className="text-xs text-white/50 mt-0.5">{description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isExecutable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={runCode}
              disabled={isRunning}
              className="gap-1.5 h-8 px-3 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-md flex items-center"
            >
              <Play className="w-3.5 h-3.5" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className="gap-1.5 h-8 px-3 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-md flex items-center"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCode}
            className="gap-1.5 h-8 px-3 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-md flex items-center"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10 transition-all rounded-md flex items-center justify-center"
            title="Expand"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between px-3 py-2 bg-[#0d1117] border-b border-white/5">
          <TabsList className="grid w-auto grid-cols-3 bg-white/5 h-8 rounded-md p-1 border border-white/5">
            <TabsTrigger value="code" className="gap-1.5 text-xs px-3 h-6 rounded-sm data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 transition-all">
              <Code className="w-3.5 h-3.5" />
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5 text-xs px-3 h-6 rounded-sm data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 transition-all">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="output" className="gap-1.5 text-xs px-3 h-6 rounded-sm data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 transition-all" disabled={!isExecutable}>
              <Play className="w-3.5 h-3.5" />
              Output
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="code" className="mt-0 bg-[#0d1117]">
          <ScrollArea className="h-[400px] scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                background: 'transparent',
                fontSize: '13.5px',
                lineHeight: '1.65',
                padding: '24px'
              }}
              codeTagProps={{
                style: {
                  fontFamily: '"Geist Mono", "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace'
                }
              }}
            >
              {code}
            </SyntaxHighlighter>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="h-[400px] bg-white border-t border-white/5 p-4 overflow-auto text-black">
            {language === 'html' ? (
              <iframe
                srcDoc={code}
                className="w-full h-full border-0 bg-white"
                title="HTML Preview"
              />
            ) : language === 'markdown' || language === 'md' ? (
              <ScrollArea className="h-full w-full">
                <div className="p-4 prose max-w-none text-black">
                  <ReactMarkdown>{code}</ReactMarkdown>
                </div>
              </ScrollArea>
            ) : language === 'json' ? (
              <ScrollArea className="h-full">
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap text-black bg-gray-50 rounded-lg">
                  {(() => { try { return JSON.stringify(JSON.parse(code), null, 2); } catch { return code; } })()}
                </pre>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center p-4 text-center text-gray-400">
                <div>
                  <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Preview not available for {language} files</p>
                  <p className="text-xs mt-1">Use the Code tab to view the source</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="output" className="mt-0">
          <div className="h-[400px] bg-[#0a0d14] text-green-400 font-mono text-[13px] border-t border-white/5">
            {isRunning ? (
              <div className="p-6 flex items-center gap-4 text-blue-400">
                <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                <div>
                  <div className="font-medium">Executing code...</div>
                </div>
              </div>
            ) : output ? (
              <ScrollArea className="h-full">
                <pre className="p-6 whitespace-pre-wrap leading-relaxed opacity-90">{output}</pre>
              </ScrollArea>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center text-white/30">
                <Play className="w-10 h-10 mb-4 opacity-50" />
                <p className="text-sm font-medium max-w-xs">Output will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};