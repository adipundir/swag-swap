"use client";

import { useState } from "react";
import { X, ShoppingCart, MessageCircle, User, Calendar, DollarSign, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!account) {
      setPurchaseError("Please connect your wallet to purchase");
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
        onClose();
      }, 2000);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const isOwnListing = account?.toLowerCase() === listing.seller.toLowerCase();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="text-xl sm:text-2xl font-semibold line-clamp-1 pr-4">{listing.title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
            {/* Left Column - Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Price Badge */}
              <div className="flex items-center gap-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">{listing.price}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-foreground whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Seller Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-background rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Seller</p>
                    <p className="text-sm font-mono truncate">{listing.seller}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-background rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Listed</p>
                    <p className="text-sm">
                      {new Date(listing.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              {!isOwnListing && (
                <div className="space-y-3 pt-4 border-t border-border">
                  {purchaseError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{purchaseError}</p>
                    </div>
                  )}

                  {purchaseSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-green-600 dark:text-green-400">Purchase successful!</p>
                    </div>
                  )}

                  <button
                    onClick={handlePurchase}
                    disabled={purchasing || purchaseSuccess}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : purchaseSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Purchased
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Purchase Now
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-border bg-background hover:bg-muted h-12 px-6"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {showChat ? "Hide Chat" : "Message Seller"}
                  </button>
                </div>
              )}

              {isOwnListing && (
                <div className="p-4 bg-muted/50 border border-border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">This is your listing</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          {showChat && (
            <div className="border-t border-border p-4 sm:p-6">
              <Chat sellerAddress={listing.seller} listingTitle={listing.title} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

