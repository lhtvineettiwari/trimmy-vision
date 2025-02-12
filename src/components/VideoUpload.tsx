
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
}

export const VideoUpload = ({ onVideoSelect }: VideoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file);
    }
  }, [onVideoSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'video/*': []
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200",
        "hover:border-white/50 cursor-pointer",
        isDragging ? "border-white bg-white/5" : "border-white/20"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-medium mb-2">Drop your video here</h3>
      <p className="text-neutral-400">
        or click to select a file
      </p>
    </div>
  );
};
