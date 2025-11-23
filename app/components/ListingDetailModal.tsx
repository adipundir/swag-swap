"use client";

import { useState } from "react";
import { X, ShoppingCart, MessageCircle, User, Calendar, Loader2, CheckCircle2, AlertCircle, Key } from "lucide-react";
import { Listing } from "./Listings";
import { Chat } from "./Chat";

interface ListingDetailModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  account: string | null;
  onPurchase: (listingId: string) => Promise<void>;
}

export function ListingDetailModal({ listing, isOpen, onClose, account, onPurchase }: ListingDetailModalProps) {
  const [showChat, setShowChat] = useState(false);
  const [purchaseCode, setPurchaseCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Reset code state when modal closes
  const handleClose = () => {
    setPurchaseCode("");
    setCodeVerified(false);
    setCodeError(null);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleVerifyCode = async () => {
    if (!purchaseCode.trim()) {
      setCodeError("Please enter a swap code");
      return;
    }

    setVerifyingCode(true);
    setCodeError(null);

    try {
      const response = await fetch("/api/listings/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing.id,
          code: purchaseCode.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.verified) {
        setCodeVerified(true);
        setCodeError(null);
      } else {
        setCodeError(data.error || "Invalid swap code");
        setCodeVerified(false);
      }
    } catch (err) {
      setCodeError("Failed to verify code. Please try again.");
      setCodeVerified(false);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handlePurchase = async () => {
    if (!account) {
      setPurchaseError("Please connect your wallet to swap");
      return;
    }

    if (!codeVerified) {
      setPurchaseError("Please verify the swap code first");
      return;
    }

    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);

    try {
      await onPurchase(listing.id);
      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
        handleClose();
      }, 2000);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setPurchasing(false);
    }
  };

  const isOwnListing = account?.toLowerCase() === listing.seller.toLowerCase();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-border">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold line-clamp-1 pr-2 sm:pr-4">{listing.title}</h2>
          <button
            onClick={handleClose}
            className="shrink-0 p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-4 lg:p-6">
            {/* Left Column - Image */}
            <div className="space-y-3 sm:space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Description</h3>
                <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Swapper Info */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <div className="p-1.5 sm:p-2 bg-background rounded-lg shrink-0">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Swapper</p>
                    <p className="text-xs sm:text-sm font-mono truncate">{listing.seller}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <div className="p-1.5 sm:p-2 bg-background rounded-lg shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Listed</p>
                    <p className="text-xs sm:text-sm">
                      {new Date(listing.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Swap/Trade Section */}
              {!isOwnListing && (
                <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-border">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md text-xs sm:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 sm:h-12 px-4 sm:px-6"
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{showChat ? "Hide Chat" : "Message to Swap/Trade"}</span>
                    <span className="sm:hidden">{showChat ? "Hide Chat" : "Message to Swap"}</span>
                  </button>
                  <p className="text-[10px] sm:text-xs text-center text-muted-foreground px-2">
                    Chat with the swapper to arrange a trade or swap
                  </p>
                </div>
              )}

              {isOwnListing && (
                <div className="p-3 sm:p-4 bg-muted/50 border border-border rounded-lg text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">This is your listing</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          {showChat && (
            <div className="border-t border-border p-3 sm:p-4 lg:p-6">
              <Chat sellerAddress={listing.seller} listingTitle={listing.title} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

