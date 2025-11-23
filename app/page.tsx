"use client";

import { Listings } from "./components/Listings";
import { CreateListing } from "./components/CreateListing";
import { LandingPage } from "./components/LandingPage";
import { useState } from "react";
import { ShoppingBag, PlusCircle } from "lucide-react";

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "create">("browse");

  if (!showApp) {
    return <LandingPage onGetStarted={() => setShowApp(true)} />;
  }

  return (
    <main className="min-h-screen bg-muted/30 pt-8 pb-12">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* Tab Navigation */}
        <div className="flex flex-col items-center mb-6 sm:mb-10 space-y-4">
          <div className="inline-flex h-auto sm:h-12 flex-wrap sm:flex-nowrap items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground shadow-inner gap-1 sm:gap-0">
            <button
              onClick={() => setActiveTab("browse")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 sm:px-8 py-2 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "browse"
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-background/50 hover:text-foreground"
              }`}
            >
              <ShoppingBag className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Browse Listings</span>
              <span className="sm:hidden">Browse</span>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 sm:px-8 py-2 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "create"
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-background/50 hover:text-foreground"
              }`}
            >
              <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Create Listing</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 ease-out">
          {activeTab === "browse" ? (
            <div className="space-y-8">
              <Listings />
            </div>
          ) : (
            <CreateListing />
          )}
        </div>
      </div>
    </main>
  );
}
