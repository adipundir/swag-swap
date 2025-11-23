"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { FileUpload } from "./FileUpload";

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  imageCid: string;
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
    imageCid: "",
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
        imageCid: "",
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please login to create a listing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          List Your Hackathon Swag
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Item Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., ETH Denver 2024 Hoodie"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="stickers">Stickers</option>
              <option value="collectibles">Collectibles</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your item, condition, size, etc."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Price (USDC) *
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">
                USDC
              </span>
            </div>
          </div>

          {/* File Upload to Filecoin */}
          <FileUpload
            onUploadComplete={(url, cid) => {
              setFormData({ ...formData, imageUrl: url, imageCid: cid });
              setError(null);
            }}
            onUploadStart={() => {
              setError(null);
            }}
            onError={(err) => {
              setError(err);
            }}
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Listing created successfully!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Listing..." : "Create Listing"}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Your wallet address will be publicly visible
            as the seller. Make sure all information is accurate before listing.
          </p>
        </div>
      </div>
    </div>
  );
}

