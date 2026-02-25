import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/AuthDialog";
import {
  Sparkles,
  Search,
  Image as ImageIcon,
  MoreHorizontal,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  ArrowDown,
  Zap,
  EyeOff,
  FileText
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [demoQuery, setDemoQuery] = useState("");
  const { user, loading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleStart = () => {
    if (loading) return; // Wait until auth state is resolved
    if (!user) {
      setShowAuthDialog(true);
    } else {
      navigate("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Mind<br /><span className="text-sm font-normal text-muted-foreground -mt-1 block">Spark</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How It Work</a>
          <a href="#blog" className="hover:text-white transition-colors flex items-center gap-1">Blog <span className="text-[10px] text-primary">(23)</span></a>
          <a href="#plans" className="hover:text-white transition-colors">Plans</a>
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden md:flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
            <Globe className="w-4 h-4" />
            Eng
            <ChevronDownIcon className="w-3 h-3" />
          </button>
          <Button
            onClick={handleStart}
            className="bg-[#00B2FF] hover:bg-[#0AB2F4] text-white rounded-full px-6 py-2 h-10 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(0,178,255,0.3)] hover:shadow-[0_0_20px_rgba(0,178,255,0.5)]"
          >
            Get started
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center pt-16 pb-20 px-6 min-h-[calc(100vh-100px)]">

        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-sm text-white/80">Smarter chats, instant solutions</span>
        </div>

        {/* Hero Typography */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 tracking-tight text-center text-white max-w-4xl leading-[1.1]">
          Chat Smarter, Not Harder –<br />Meet MindSpa...<span className="text-primary animate-pulse">|</span>
        </h1>
        <p className="text-[#9C9CCE] text-lg font-normal mb-16 text-center max-w-2xl">
          Your Ultimate AI Chat Partner — Instant Answers, Endless Knowledge!
        </p>

        {/* Central Chat Mock Interface */}
        <div className="w-full max-w-4xl relative mt-4">

          {/* Branch Lines SVG (Desktop only) */}
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[150%] -z-10 hidden lg:block opacity-30 stroke-primary/40 pointer-events-none" style={{ fill: 'none', strokeWidth: 1, strokeDasharray: '4 4' }}>
            <path d="M 200 100 Q 150 100 100 100" />
            <path d="M 200 250 Q 150 250 100 300" />
            <path d="M 800 100 Q 850 100 900 100" />
            <path d="M 800 250 Q 850 250 900 300" />

            {/* Dots */}
            <circle cx="200" cy="100" r="3" className="fill-primary" />
            <circle cx="200" cy="250" r="3" className="fill-primary" />
            <circle cx="800" cy="100" r="3" className="fill-primary" />
            <circle cx="800" cy="250" r="3" className="fill-primary" />
          </svg>

          {/* Floating Branch Nodes (Desktop only) */}
          <div className="hidden lg:block">
            {/* Top Left */}
            <div className="absolute -left-32 top-10 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors cursor-default">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/90">Speed Performance</span>
            </div>
            {/* Bottom Left */}
            <div className="absolute -left-32 bottom-20 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors cursor-default">
              <EyeOff className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/90">User Confidentiality</span>
            </div>
            {/* Top Right */}
            <div className="absolute -right-32 top-10 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors cursor-default">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/90">Image generation</span>
            </div>
            {/* Bottom Right */}
            <div className="absolute -right-32 bottom-20 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors cursor-default">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/90">Documentations</span>
            </div>
          </div>

          {/* The Chat Input Mock */}
          <div className="relative group perspective-1000">
            {/* Sub-layers for depth effect */}
            <div className="absolute inset-0 bg-[#1A181C] rounded-3xl translate-y-3 scale-[0.98] -z-20 border border-white/5 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-[#222024] rounded-3xl translate-y-1.5 scale-[0.99] -z-10 border border-white/5 backdrop-blur-sm" />

            {/* Main Input Box */}
            <div className="bg-[#1C1A1E] border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative z-0 flex flex-col transition-all duration-300">

              <div className="flex-1 min-h-[140px] flex px-2 pt-2">
                <span className="text-primary mr-2 mt-0.5"><Sparkles className="w-4 h-4" /></span>
                <textarea
                  className="w-full bg-transparent border-0 resize-none outline-none text-white text-base placeholder:text-muted-foreground/60 h-24"
                  placeholder="Write any request or command to MindSpark"
                  value={demoQuery}
                  onChange={(e) => setDemoQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <span className="text-white text-lg leading-none">+</span>
                  </button>
                  <button className="px-4 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center gap-2 transition-colors border border-white/5">
                    <Search className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/90">Search</span>
                  </button>
                  <button className="px-4 h-10 rounded-full bg-white/5 hover:bg-white/10 hidden sm:flex items-center gap-2 transition-colors border border-white/5">
                    <ImageIcon className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/90">Create Image</span>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-white/70" />
                  </button>
                </div>

                <Button
                  onClick={handleStart}
                  className="bg-white/10 text-white hover:bg-white/20 px-8 h-10 rounded-full font-medium transition-colors border border-white/5"
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer Elements */}
      <footer className="absolute bottom-0 w-full p-8 flex justify-between items-end z-20 pointer-events-none">

        <div className="flex flex-col gap-3 pointer-events-auto">
          <span className="text-xs text-muted-foreground font-medium">Our Socials:</span>
          <div className="flex items-center gap-3">
            <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pointer-events-auto group cursor-pointer">
          <span className="text-xs text-white/70 group-hover:text-white transition-colors tracking-wide">Scroll to explore</span>
          <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
            <ArrowDown className="w-3 h-3 text-white/70 group-hover:text-white transition-colors" />
          </div>
        </div>

      </footer>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
};

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default Index;