
import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { VideoEditor } from "@/components/VideoEditor";
import { cn } from "@/lib/utils";

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[915px] mx-auto bg-white rounded-lg p-6">
        <header className="flex items-center mb-8">
          <h1 className="text-[18px] font-medium text-black font-inter ml-4">Add Media</h1>
        </header>
        
        <main className={cn(
          "transition-all duration-300",
          videoFile ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {!videoFile ? (
            <VideoUpload onVideoSelect={setVideoFile} />
          ) : (
            <VideoEditor videoFile={videoFile} onBack={() => setVideoFile(null)} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
