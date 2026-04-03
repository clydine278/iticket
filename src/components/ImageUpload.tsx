import { useRef } from "react";
import { useR2Upload } from "@/hooks/use-r2-upload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ImageIcon, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: string;
  placeholder?: string;
}

const ImageUpload = ({ value, onChange, folder = "uploads", className = "", aspectRatio = "16/9", placeholder = "Click to upload image" }: ImageUploadProps) => {
  const { upload, uploading, progress } = useR2Upload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await upload(file, {
        folder,
        maxSizeMB: 10,
        acceptedTypes: ["image/"],
      });
      if (url) {
        onChange(url);
        toast({ title: "Image uploaded successfully!" });
      }
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={`relative ${className}`}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border" style={{ aspectRatio }}>
          <img src={value} alt="Upload" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
              Change
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={() => onChange("")}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer"
          style={{ aspectRatio }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 w-full px-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="w-full max-w-[200px] space-y-1">
                <Progress value={progress} className="h-2" />
                <span className="text-xs text-center block">{progress}% uploading...</span>
              </div>
            </div>
          ) : (
            <>
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm">{placeholder}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
