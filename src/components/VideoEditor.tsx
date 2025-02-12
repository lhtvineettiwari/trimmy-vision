
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

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    toast.success("Video rotated");
  };

  const handleTrimChange = (values: number[]) => {
    setTrimStart(values[0]);
    setTrimEnd(values[1]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Button
        variant="ghost"
        className="text-neutral-400 hover:text-white"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="aspect-[9/16] bg-black/20 rounded-lg overflow-hidden mx-auto max-w-sm">
        <video
          ref={videoRef}
          src={videoUrl}
          className={cn(
            "w-full h-full object-contain transition-transform duration-300",
            rotation && `rotate-${rotation}`
          )}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          controls
        />
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={handleRotate}
        >
          <RotateCw className="w-5 h-5" />
          <span className="text-xs">Rotate</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => toast.info("Crop feature coming soon")}
        >
          <Crop className="w-5 h-5" />
          <span className="text-xs">Crop</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => toast.info("Trim feature coming soon")}
        >
          <Scissors className="w-5 h-5" />
          <span className="text-xs">Trim</span>
        </Button>
      </div>

      <div className="max-w-sm mx-auto space-y-2">
        <p className="text-sm text-neutral-400">Trim Video</p>
        <Slider
          defaultValue={[0, 100]}
          max={100}
          step={1}
          onValueChange={handleTrimChange}
        />
        <div className="flex justify-between text-xs text-neutral-400">
          <span>{formatTime(trimStart * duration / 100)}</span>
          <span>{formatTime(trimEnd * duration / 100)}</span>
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
