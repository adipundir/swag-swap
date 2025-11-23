"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    // Add smooth scrolling with momentum
    const html = document.documentElement;
    html.style.scrollBehavior = "smooth";
    
    // Add momentum scrolling for iOS
    const body = document.body;
    (body.style as any).webkitOverflowScrolling = "touch";
    
    // Custom scroll easing
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    
    const handleWheel = (e: WheelEvent) => {
      if (!isScrolling) {
        isScrolling = true;
        
        // Add slight delay for friction effect
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 150);
      }
    };
    
    window.addEventListener("wheel", handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return null;
}

