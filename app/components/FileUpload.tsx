"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, Check, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadStart?: () => void;
  onError?: (error: string) => void;
}

export function FileUpload({
  onUploadComplete,
  onUploadStart,
  onError,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onError?.("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError?.("File size must be less than 10MB");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Vercel Blob
    setUploading(true);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const data = await response.json();
      onUploadComplete(data.url);
      setPreview(data.url); // Update preview to use the blob URL
    } catch (error) {
      console.error("Upload error:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to upload file"
      );
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <div>
        <div className="group relative">
          <label
            htmlFor="file-upload"
            className={`relative flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            } ${preview ? "hidden" : "flex"}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center p-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-muted-foreground group-hover:text-primary">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="mb-2 text-sm font-medium text-foreground">
                <span className="text-primary font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                SVG, PNG, JPG or GIF (MAX. 10MB)
              </p>
            </div>
          </label>
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-border shadow-sm group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover"
          />
          
          {uploading ? (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-foreground text-sm font-medium">Uploading to Vercel Blob...</p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-background/90 hover:bg-background text-destructive rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  Stored on Vercel Blob
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
