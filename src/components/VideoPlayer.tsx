import { memo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
  // Handle embed format: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  
  // Handle youtu.be format
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Handle youtube.com/watch?v= format
  const longMatch = url.match(/[?&]v=([^&]+)/);
  if (longMatch) return longMatch[1];
  
  return null;
};

interface VideoPlayerProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  posterImage?: string;
}

export const VideoPlayer = memo(({
  videoUrl,
  isOpen,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
  posterImage
}: VideoPlayerProps) => {
  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black/10 rounded-lg">
        <p className="text-muted-foreground">Неверная ссылка на видео</p>
      </div>
    );
  }

  if (isFullscreen && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black border-none">
          <VisuallyHidden.Root>
            <DialogTitle>YouTube Video Player</DialogTitle>
            <DialogDescription>Fullscreen YouTube video player</DialogDescription>
          </VisuallyHidden.Root>
          
          <div className="relative w-full h-full flex items-center justify-center">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 'none' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Non-fullscreen mode - embedded player
  return (
    <div className="relative w-full h-full bg-black/5 rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="YouTube video player"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full rounded-lg"
        style={{ border: 'none' }}
      />
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
