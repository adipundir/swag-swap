"use client";

import { Listings } from "./components/Listings";
import { FundWallet } from "./components/FundWallet";
import { CreateListing } from "./components/CreateListing";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"browse" | "create">("browse");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="py-8">
        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("browse")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "browse"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Browse Listings
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "create"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Create Listing
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "browse" ? (
          <>
            <FundWallet />
            <Listings />
          </>
        ) : (
          <CreateListing />
        )}
      </div>
    </div>
  );
}
