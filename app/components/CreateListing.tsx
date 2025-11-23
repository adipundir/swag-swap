"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { Tag, Type, AlignLeft, Upload, CheckCircle2, AlertCircle, Loader2, Key, Copy } from "lucide-react";

interface ListingFormData {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

export function CreateListing() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    imageUrl: "",
    category: "clothing",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchaseCode, setPurchaseCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetFileUpload, setResetFileUpload] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authenticated || !wallets[0]?.address) {
      setError("Please login to create a listing");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // POST to backend API
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          seller: wallets[0].address,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create listing");
      }

      console.log("Listing created:", data.listing);

      setSuccess(true);
      setPurchaseCode(data.purchaseCode || null);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        category: "clothing",
      });

      // Reset file upload component
      setResetFileUpload((prev) => prev + 1);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!authenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
          <p className="text-muted-foreground">
            Please login to create a listing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-card border border-border/60 rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-border/60">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-1">
            List Your Hackathon Swag
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Create a listing to swap your exclusive merchandise on the decentralized marketplace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Type className="w-3.5 h-3.5" />
              Item Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., ETH Denver 2024 Hoodie"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Tag className="w-3.5 h-3.5" />
              Category <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              >
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="stickers">Stickers</option>
                <option value="collectibles">Collectibles</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your item, condition, size, etc."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-3 pt-4 border-t border-border/60">
             <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" />
              Product Image
            </label>
            <div className="bg-muted/30 rounded-lg border border-dashed border-border p-4">
              <FileUpload
                key={resetFileUpload}
                onUploadComplete={(url) => {
                  setFormData({ ...formData, imageUrl: url });
                  setError(null);
                }}
                onUploadStart={() => {
                  setError(null);
                }}
                onError={(err) => {
                  setError(err);
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-500 rounded-lg flex items-start gap-3 text-sm animate-in fade-in-50 slide-in-from-top-2 duration-300">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Listing created successfully!</p>
                  <p className="text-xs mt-1 text-green-600/80 dark:text-green-500/80">
                    Your listing has been saved to the database and is now available for others to view.
                  </p>
                </div>
              </div>

              {/* Purchase Code Display */}
              {purchaseCode && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">Your Purchase Code</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-background border border-border rounded-md px-4 py-3">
                      <p className="text-2xl font-mono font-bold text-primary tracking-widest text-center">
                        {purchaseCode}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(purchaseCode);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-4"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong className="font-medium text-foreground">Important:</strong> Share this code with swappers. 
                    They will need it to complete the swap. Save it securely!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Listing...
              </>
            ) : (
              "Create Listing"
            )}
          </button>
        </form>

        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-muted/30 border-t border-border/60 rounded-b-xl">
          <p className="text-xs text-muted-foreground text-center">
            <strong className="font-medium text-foreground">Note:</strong> Your wallet address will be publicly visible
            as the swapper. Images are stored in the database.
          </p>
        </div>
      </div>
    </div>
  );
}
