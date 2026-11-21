import { Link, useMatchRoute } from '@tanstack/react-router';
import { Box, BookOpen, Loader2, Mic, Server, Speaker, Volume2, X } from 'lucide-react';
import { useState } from 'react';
import voiceboxLogo from '@/assets/voicebox-logo.png';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import { useGenerationStore } from '@/stores/generationStore';
import { usePlayerStore } from '@/stores/playerStore';

interface SidebarProps {
  isMacOS?: boolean;
}

const tabs = [
  { id: 'main', path: '/', icon: Volume2, label: 'Generate' },
  { id: 'stories', path: '/stories', icon: BookOpen, label: 'Stories' },
  { id: 'voices', path: '/voices', icon: Mic, label: 'Voices' },
  { id: 'audio', path: '/audio', icon: Speaker, label: 'Audio' },
  { id: 'models', path: '/models', icon: Box, label: 'Models' },
  { id: 'server', path: '/server', icon: Server, label: 'Server' },
];

export function Sidebar({ isMacOS }: SidebarProps) {
  const isGenerating = useGenerationStore((state) => state.isGenerating);
  const setIsGenerating = useGenerationStore((state) => state.setIsGenerating);
  const setActiveGenerationId = useGenerationStore((state) => state.setActiveGenerationId);
  const audioUrl = usePlayerStore((state) => state.audioUrl);
  const isPlayerVisible = !!audioUrl;
  const matchRoute = useMatchRoute();

  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelGeneration = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await apiClient.cancelAllGenerations();
      // Clear local generating state immediately; the active-tasks poll will
      // confirm the server side is clear on its next tick.
      setIsGenerating(false);
      setActiveGenerationId(null);
    } catch (error) {
      console.error('Failed to cancel generation:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-full w-20 bg-sidebar border-r border-border flex flex-col items-center py-6 gap-6',
        isMacOS && 'pt-14',
      )}
    >
      {/* Logo */}
      <div className="mb-2">
        <img src={voiceboxLogo} alt="Voicebox" className="w-12 h-12 object-contain" />
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // For index route, use exact match; for others, use default matching
          const isActive =
            tab.path === '/'
              ? matchRoute({ to: '/' })
              : matchRoute({ to: tab.path });

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
                'hover:bg-muted/50',
                isActive ? 'bg-muted/50 text-foreground shadow-lg' : 'text-muted-foreground',
              )}
              title={tab.label}
              aria-label={tab.label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>

      {/* Spacer to push loader to bottom */}
      <div className="flex-1" />

      {/* Generation Loader / Cancel button */}
      {isGenerating && (
        <div
          className={cn(
            'w-full flex items-center justify-center transition-all duration-200',
            isPlayerVisible ? 'mb-[120px]' : 'mb-0',
          )}
        >
          <button
            type="button"
            onClick={handleCancelGeneration}
            disabled={isCancelling}
            title="Cancel generation"
            aria-label="Cancel generation"
            className="group relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Loader2 className="h-6 w-6 text-accent animate-spin group-hover:opacity-0 transition-opacity" />
            <X className="h-5 w-5 text-destructive absolute opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      )}
    </div>
  );
}
