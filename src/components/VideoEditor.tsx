
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
        className="text-neutral-600 hover:text-neutral-900"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="aspect-[9/16] bg-[#F5F5F5] rounded-lg overflow-hidden">
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
              className="flex flex-col items-center gap-2 h-auto py-3"
              onClick={() => toast.info("Crop feature coming soon")}
            >
              <Crop className="w-5 h-5" />
              <span className="text-xs">Crop</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-3"
              onClick={() => toast.info("Trim feature coming soon")}
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
            <p className="text-sm text-neutral-600">Trim Video</p>
            <Slider
              defaultValue={[0, 100]}
              max={100}
              step={1}
              onValueChange={handleTrimChange}
              className="my-4"
            />
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
