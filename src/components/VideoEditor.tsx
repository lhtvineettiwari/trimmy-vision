import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Crop, RotateCw, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoEditorProps {
  videoFile: File;
  onBack: () => void;
}

export const VideoEditor = ({ videoFile, onBack }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [rotation, setRotation] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isCropping, setIsCropping] = useState(false);
  const [cropDimensions, setCropDimensions] = useState({ x: 0, y: 0, width: 100, height: 100 });

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    generateThumbnails(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const generateThumbnails = async (videoUrl: string) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    await video.load();
    
    const thumbnailCount = 8;
    const thumbs: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.addEventListener('loadedmetadata', () => {
      canvas.width = 120;
      canvas.height = (120 * 9) / 16;
      
      for (let i = 0; i < thumbnailCount; i++) {
        video.currentTime = (video.duration / thumbnailCount) * i;
        video.addEventListener('seeked', () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            thumbs.push(canvas.toDataURL());
            if (thumbs.length === thumbnailCount) {
              setThumbnails(thumbs);
            }
          }
        }, { once: true });
      }
    });
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      const startTime = trimStart * duration / 100;
      const endTime = trimEnd * duration / 100;
      
      if (time < startTime) {
        videoRef.current.currentTime = startTime;
      } else if (time > endTime) {
        videoRef.current.currentTime = startTime; // Loop back to start when reaching end
      }
      setCurrentTime(time);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => {
      let newRotation = prev + 90;
      if (newRotation >= 360) newRotation = 0;
      toast.success(`Rotated ${newRotation === 0 ? '360' : newRotation}°`);
      return newRotation;
    });
  };

  const handleTrimChange = (values: number[]) => {
    setTrimStart(values[0]);
    setTrimEnd(values[1]);
    if (videoRef.current) {
      const currentStart = trimStart * duration / 100;
      const currentEnd = trimEnd * duration / 100;
      const newStart = values[0] * duration / 100;
      const newEnd = values[1] * duration / 100;
      
      if (Math.abs(currentStart - newStart) > Math.abs(currentEnd - newEnd)) {
        videoRef.current.currentTime = newStart;
      } else {
        videoRef.current.currentTime = newEnd;
      }
    }
    generateTrimmedThumbnails(videoUrl, values[0], values[1]);
  };

  const generateTrimmedThumbnails = async (url: string, start: number, end: number) => {
    const video = document.createElement('video');
    video.src = url;
    await video.load();
    
    const thumbnailCount = 8;
    const thumbs: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.addEventListener('loadedmetadata', () => {
      canvas.width = 120;
      canvas.height = (120 * 9) / 16;
      
      const startTime = (start * video.duration) / 100;
      const endTime = (end * video.duration) / 100;
      const duration = endTime - startTime;
      
      for (let i = 0; i < thumbnailCount; i++) {
        const currentTime = startTime + (duration / thumbnailCount) * i;
        video.currentTime = currentTime;
        video.addEventListener('seeked', () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            thumbs.push(canvas.toDataURL());
            if (thumbs.length === thumbnailCount) {
              setThumbnails(thumbs);
            }
          }
        }, { once: true });
      }
    });
  };

  const handleCropToggle = () => {
    setIsCropping(!isCropping);
    if (!isCropping) {
      toast.info("Click and drag on the video to crop");
    }
  };

  const handleCropStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCropDimensions({ x, y, width: 0, height: 0 });
  };

  const handleCropMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCropDimensions(prev => ({
      ...prev,
      width: currentX - prev.x,
      height: currentY - prev.y
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Button
        variant="ghost"
        className="text-neutral-600 hover:text-neutral-900"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div 
            className="aspect-[9/16] bg-[#F5F5F5] rounded-lg overflow-hidden relative"
            onMouseDown={handleCropStart}
            onMouseMove={handleCropMove}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className={cn(
                "w-full h-full object-contain transition-transform duration-300",
                {
                  'rotate-90': rotation === 90,
                  'rotate-180': rotation === 180,
                  'rotate-[270deg]': rotation === 270,
                  'rotate-[360deg]': rotation === 0,
                }
              )}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              controls
            />
            {isCropping && (
              <div 
                className="absolute border-2 border-blue-500 bg-blue-500/20"
                style={{
                  left: `${cropDimensions.x}%`,
                  top: `${cropDimensions.y}%`,
                  width: `${cropDimensions.width}%`,
                  height: `${cropDimensions.height}%`
                }}
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-3"
              onClick={handleRotate}
            >
              <RotateCw className="w-5 h-5" />
              <span className="text-xs">Rotate</span>
            </Button>
            
            <Button
              variant="outline"
              className={cn(
                "flex flex-col items-center gap-2 h-auto py-3",
                isCropping && "bg-blue-50"
              )}
              onClick={handleCropToggle}
            >
              <Crop className="w-5 h-5" />
              <span className="text-xs">Crop</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-3"
            >
              <Scissors className="w-5 h-5" />
              <span className="text-xs">Trim</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-black mb-1.5 block">Description</label>
            <textarea
              className="w-full min-h-[132px] rounded-md border-[1.6px] border-[#E5E7EA] p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4633DC]"
              placeholder="Add a description..."
            />
          </div>

          <Button 
            className="w-full bg-[#4633DC] hover:bg-[#4633DC]/90 text-white font-semibold py-2.5"
          >
            Next
          </Button>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-600">Trim Video</p>
              <p className="text-sm font-medium">{formatTime(currentTime)}</p>
            </div>
            
            <div className="relative">
              <div className="flex overflow-hidden rounded-lg mb-2 h-20">
                {thumbnails.map((thumb, i) => (
                  <img 
                    key={i}
                    src={thumb}
                    alt={`Thumbnail ${i}`}
                    className="h-full object-cover"
                    style={{ width: `${100 / thumbnails.length}%` }}
                  />
                ))}
              </div>
              <Slider
                defaultValue={[0, 100]}
                value={[trimStart, trimEnd]}
                max={100}
                step={1}
                onValueChange={handleTrimChange}
                className="my-4"
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-600">
              <span>{formatTime(trimStart * duration / 100)}</span>
              <span>{formatTime(trimEnd * duration / 100)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
