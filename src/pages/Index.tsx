
import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { VideoEditor } from "@/components/VideoEditor";
import { cn } from "@/lib/utils";

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-[rgb(18,18,18)] text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <p className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Video Editor</p>
          <h1 className="text-4xl font-bold">Create Perfect Videos</h1>
        </header>
        
        <main className={cn(
          "max-w-4xl mx-auto transition-all duration-300",
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
