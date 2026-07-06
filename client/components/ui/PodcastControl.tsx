// client/components/ui/PodcastControl.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './button';
import { Slider } from './slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Headset, Loader2, Play, Pause, Download, AlertTriangle } from 'lucide-react';
import { usePodcastStatus, useActivePodcastUrl, useActiveDocumentId, useAppActions } from '@/lib/store';
import { useApi } from '@/hooks/use-api';

export const PodcastControl = () => {
  const api = useApi();
  const actions = useAppActions();
  const status = usePodcastStatus();
  const documentId = useActiveDocumentId();
  const podcastUrl = useActivePodcastUrl();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Effect to manage the audio element's event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if(audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onEnded = () => setIsPlaying(false);
    const onLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [audioRef.current, podcastUrl]); // Re-attach listeners if the URL changes
  
  const handleGenerate = () => {
    if (documentId) actions.generatePodcast(documentId, api);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = (value[0] / 100) * duration;
  };

  const handleDownload = useCallback(() => {
    if (podcastUrl) {
      const link = document.createElement('a');
      link.href = podcastUrl;
      link.setAttribute('download', 'podcast.mp3');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [podcastUrl]);

  switch (status) {
    case 'GENERATING':
      return (
        <Button variant="outline" disabled className="w-40">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </Button>
      );
    
    case 'COMPLETED':
      if (!podcastUrl) return null; // Or show an error state
      return (
        <div className="flex items-center gap-2 p-2 border rounded-lg bg-card w-64">
          <audio ref={audioRef} src={podcastUrl} preload="metadata" className="hidden" />
          <Button onClick={togglePlay} variant="ghost" size="icon">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Slider value={[progress]} onValueChange={handleSliderChange} className="flex-1" />
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleDownload} variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Download Podcast</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );

    case 'FAILED':
      return (
        <Button variant="destructive" disabled className="w-48">
          <AlertTriangle className="mr-2 h-4 w-4" /> Generation Failed
        </Button>
      );
      
    case 'NONE':
    default:
      return (
        <Button variant="outline" onClick={handleGenerate} disabled={!documentId}>
          <Headset className="mr-2 h-4 w-4" /> Generate Podcast
        </Button>
      );
  }
};