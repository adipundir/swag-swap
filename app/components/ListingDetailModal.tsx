"use client";

import { useState } from "react";
import { X, ShoppingCart, MessageCircle, User, Calendar, DollarSign, Loader2, CheckCircle2, AlertCircle, Key } from "lucide-react";
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
      setCodeError("Please enter a purchase code");
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
        setCodeError(data.error || "Invalid purchase code");
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
      setPurchaseError("Please connect your wallet to purchase");
      return;
    }

    if (!codeVerified) {
      setPurchaseError("Please verify the purchase code first");
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
      setPurchaseError(err instanceof Error ? err.message : "Purchase failed");
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="text-xl sm:text-2xl font-semibold line-clamp-1 pr-4">{listing.title}</h2>
          <button
            onClick={handleClose}
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
                  {/* Purchase Code Input */}
                  {!codeVerified ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Purchase Code
                        </label>
                        <p className="text-xs text-muted-foreground mb-3">
                          Enter the purchase code provided by the seller to proceed with the purchase.
                        </p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={purchaseCode}
                              onChange={(e) => {
                                setPurchaseCode(e.target.value.toUpperCase().slice(0, 6));
                                setCodeError(null);
                              }}
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                              className="flex h-12 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm font-mono tracking-widest ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <button
                            onClick={handleVerifyCode}
                            disabled={verifyingCode || !purchaseCode.trim() || purchaseCode.length !== 6}
                            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 shrink-0"
                          >
                            {verifyingCode ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify"
                            )}
                          </button>
                        </div>
                        {codeError && (
                          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            <p className="text-xs text-destructive">{codeError}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Code verified!</p>
                        <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                          You can now proceed with the purchase.
                        </p>
                      </div>
                    </div>
                  )}

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
                    disabled={purchasing || purchaseSuccess || !codeVerified}
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
                        swap/trade
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

