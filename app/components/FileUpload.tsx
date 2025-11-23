"use client";

import { useState, useRef } from "react";
import { uploadToFilecoin } from "../lib/filecoin";

interface FileUploadProps {
  onUploadComplete: (url: string, cid: string) => void;
  onUploadStart?: () => void;
  onError?: (error: string) => void;
}

export function FileUpload({
  onUploadComplete,
  onUploadStart,
  onError,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
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

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Filecoin
    setUploading(true);
    onUploadStart?.();

    try {
      const { cid, url } = await uploadToFilecoin(file);
      onUploadComplete(url, cid);
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
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Upload Image to Filecoin
        </label>
        <div className="flex items-center space-x-4">
          <label
            htmlFor="file-upload"
            className={`px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {uploading ? "Uploading..." : "Choose Image"}
            </span>
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
          {preview && (
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Images will be stored on Filecoin via IPFS (Max 10MB)
        </p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-md border border-gray-200 dark:border-gray-700"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
              <div className="text-white text-sm">
                Uploading to Filecoin...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filecoin Badge */}
      {preview && !uploading && (
        <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Stored on Filecoin Onchain Cloud</span>
        </div>
      )}
    </div>
  );
}

