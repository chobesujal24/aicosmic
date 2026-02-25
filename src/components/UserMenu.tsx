import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Archive, Download, LogOut, ChevronDown } from "lucide-react";
import { SettingsDialog } from "./SettingsDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const handleDownloadApp = () => {
    // Create professional download interface
    const downloadMenu = document.createElement('div');
    downloadMenu.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(8px);
    `;

    downloadMenu.innerHTML = `
      <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 500px; width: 90%; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            ✨
          </div>
          <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Download Cosmic AI</h2>
          <p style="margin: 0; color: #6b7280; font-size: 16px;">Get the native app for the best experience</p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
          <button onclick="downloadWindows()" style="padding: 16px 24px; background: #0078d4; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.2s;">
            <span style="font-size: 20px;">💻</span>
            <div style="text-align: left;">
              <div>Windows App</div>
              <div style="font-size: 12px; opacity: 0.8;">For Windows 10/11</div>
            </div>
          </button>
          
          <button onclick="downloadAndroid()" style="padding: 16px 24px; background: #34a853; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.2s;">
            <span style="font-size: 20px;">📲</span>
            <div style="text-align: left;">
              <div>Android APK</div>
              <div style="font-size: 12px; opacity: 0.8;">For Android 7.0+</div>
            </div>
          </button>
        </div>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: left;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">How to get API keys:</h4>
          <ul style="margin: 0; padding-left: 16px; color: #6b7280; font-size: 13px; line-height: 1.5;">
            <li>Offline AI processing</li>
            <li>Native file system integration</li>
            <li>Desktop notifications</li>
            <li>System tray quick access</li>
            <li>Enhanced performance</li>
          </ul>
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="flex: 1; padding: 12px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">
            Close
          </button>
          <button onclick="window.open('mailto:sujalchobe@gmail.com?subject=Cosmic AI App Development', '_blank')" style="flex: 1; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">
            Contact Dev
          </button>
        </div>
      </div>
      
      <script>
        function downloadWindows() {
          const content = \`Cosmic AI - Windows Application

🖥️ WINDOWS INSTALLATION GUIDE

System Requirements:
• Windows 10 (version 1903) or Windows 11
• 4GB RAM (8GB recommended)
• 500MB free disk space
• Internet connection for AI features
• DirectX 11 compatible graphics

Installation Steps:
1. Download: cosmic-ai-setup.exe (Coming Soon)
2. Right-click → "Run as administrator"
3. Follow the installation wizard
4. Launch from Start Menu or Desktop

Features:
✨ Native Windows integration
🚀 Faster performance than web version
📁 Direct file system access
🔔 Desktop notifications
⚡ Offline mode (limited features)
🎨 Windows 11 design language

Development Status: 95% Complete
Expected Release: Q2 2024

For updates and early access:
📧 Email: sujalchobe@gmail.com
🌐 Web: https://cosmic-ai.app

© 2024 Cosmic AI - Advanced AI Assistant\`;
          
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Cosmic-AI-Windows-Setup-Guide.txt';
          a.click();
          URL.revokeObjectURL(url);
        }
        
        function downloadAndroid() {
          const content = \`Cosmic AI - Android Application

📱 ANDROID INSTALLATION GUIDE

System Requirements:
• Android 7.0 (API level 24) or higher
• 2GB RAM (4GB recommended)
• 100MB free storage
• Internet connection for AI features
• ARM64 or x86_64 processor

Installation Steps:
1. Download: cosmic-ai.apk (Coming Soon)
2. Settings → Security → "Unknown sources" (Enable)
3. Open downloaded APK file
4. Tap "Install" and wait for completion
5. Launch from app drawer

Features:
✨ Native Android Material Design
🚀 Optimized for mobile performance
📷 Camera integration for image analysis
🎤 Voice input with speech recognition
📱 Adaptive UI for all screen sizes
🔔 Push notifications
⚡ Background processing

Development Status: 90% Complete
Expected Release: Q2 2024

Beta Testing:
Join our beta program for early access!

For updates and beta access:
📧 Email: sujalchobe@gmail.com
🌐 Web: https://cosmic-ai.app

© 2024 Cosmic AI - Advanced AI Assistant\`;
          
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Cosmic-AI-Android-Setup-Guide.txt';
          a.click();
          URL.revokeObjectURL(url);
        }
      </script>
    `;

    document.body.appendChild(downloadMenu);

    toast({
      title: "App Downloads",
      description: "Native apps coming soon with enhanced features!",
    });
  };

  const handleArchivedChats = () => {
    toast({
      title: "Archived Chats",
      description: "Viewing archived conversations.",
    });
  };

  const handleLogout = async () => {
    await logout();
    // Additional local cleanup if needed
  };

  // Helper to extract a display name
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 px-2 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center gap-2">
            <Avatar className="h-7 w-7 rounded-md">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={displayName} className="rounded-md object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-[#00B2FF] to-purple-600 text-white rounded-md text-xs font-semibold">
                  {initial}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm font-medium mr-1 text-white/90 truncate max-w-[100px]">{displayName}</span>
            <ChevronDown className="w-3 h-3 text-white/50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#1C1F23] border border-white/10 text-white shadow-2xl rounded-xl" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-3">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm truncate max-w-[180px]">{displayName}</p>
              {user?.email && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchivedChats}>
            <Archive className="mr-2 h-4 w-4" />
            Archived Chats
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadApp}>
            <Download className="mr-2 h-4 w-4" />
            Download the App
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}