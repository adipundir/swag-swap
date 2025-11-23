"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { Tag, Type, AlignLeft, DollarSign, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
}

export function CreateListing() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "clothing",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          price: `${formData.price} USDC`,
          seller: wallets[0].address,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create listing");
      }

      console.log("Listing created:", data.listing);

      setSuccess(true);
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        imageUrl: "",
        category: "clothing",
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-border/60 rounded-xl shadow-sm">
        <div className="p-6 sm:p-8 border-b border-border/60">
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">
            List Your Hackathon Swag
          </h2>
          <p className="text-muted-foreground text-sm">
            Create a listing to sell your exclusive merchandise on the decentralized marketplace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
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

          <div className="grid grid-cols-2 gap-6">
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

            {/* Price */}
            <div className="space-y-2">
              <label
                htmlFor="price"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Price <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-12"
                />
                <span className="absolute right-3 top-2.5 text-xs font-medium text-muted-foreground">
                  USDC
                </span>
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
            <div className="p-4 bg-green-500/10 text-green-600 dark:text-green-500 rounded-lg flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Listing created successfully!</p>
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

        <div className="px-6 py-4 bg-muted/30 border-t border-border/60 rounded-b-xl">
          <p className="text-xs text-muted-foreground text-center">
            <strong className="font-medium text-foreground">Note:</strong> Your wallet address will be publicly visible
            as the seller. Images are stored in the database.
          </p>
        </div>
      </div>
    </div>
  );
}
