"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { getImageUrl } from "@/lib/utils/imageUtils";
import axiosInstance from "@/lib/axios";

/**
 * Hook to track ad impressions
 * Tracks when an ad is visible for more than 2 seconds
 */
const useAdImpression = (ad, agentId, onImpression) => {
  const elementRef = useRef(null);
  const timerRef = useRef(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!ad || !agentId || hasTrackedRef.current) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start timer when ad becomes visible
            timerRef.current = setTimeout(() => {
              if (!hasTrackedRef.current) {
                hasTrackedRef.current = true;
                if (onImpression) {
                  onImpression(ad);
                }
              }
            }, 2000); // 2 seconds
          } else {
            // Clear timer if ad is no longer visible
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
          }
        });
      },
      {
        threshold: 0.5, // At least 50% of the ad must be visible
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [ad, agentId, onImpression]);

  return elementRef;
};

const AdMedia = ({ ad, className, showPlayIcon = false, priority = false }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate ad has media
  if (!ad || (!ad.video && !ad.image)) {
    return (
      <div className="relative w-full h-full bg-slate-200 flex items-center justify-center">
        <div className="text-slate-400 text-sm">No media available</div>
      </div>
    );
  }

  // Construct media URL using getImageUrl utility
  const mediaUrl = ad.video
    ? getImageUrl(ad.video)
    : ad.image
      ? getImageUrl(ad.image)
      : "";

  const actualIsVideo = !!ad.video; // Determine video status from actual video path

  // Check if mediaUrl is valid (not empty, not just the fallback)
  if (!mediaUrl || mediaUrl === "") {
    return (
      <div className="relative w-full h-full bg-slate-200 flex items-center justify-center">
        <div className="text-slate-400 text-sm">No media available</div>
      </div>
    );
  }

  if (actualIsVideo && ad.video && !hasError) {
    return (
      <div className="relative w-full h-full bg-slate-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <video
          key={mediaUrl}
          className={cn("w-full h-full object-cover", className)}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => {
            console.error("Video load error:", mediaUrl);
            setHasError(true);
            setIsLoading(false);
          }}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onLoadedData={() => setIsLoading(false)}
        >
          <source src={mediaUrl} type="video/mp4" />
          <source src={mediaUrl} type="video/webm" />
        </video>
        {showPlayIcon && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback to image
  return (
    <div className="relative w-full h-full bg-slate-100">
      <Image
        src={mediaUrl}
        className={cn("object-cover", className)}
        alt={ad.title || "Sponsored Ad"}
        fill
        unoptimized
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={85}
        loading={priority ? "eager" : "lazy"}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

/**
 * Modern "Sponsored" Label - Subtle & Clean
 */
// Note: AdLabel is kept for potential future use but currently unused

// --- AD SLOT CONFIGURATION (TechCrunch-inspired) ---
const AD_DIMENSIONS = {
  // Horizontal Ads (Top & Bottom Banners)
  horizontal: {
    desktop: { width: 970, height: 250, aspectRatio: "970/250" }, // Leaderboard
    tablet: { width: 728, height: 90, aspectRatio: "728/90" }, // Leaderboard
    mobile: { width: 320, height: 100, aspectRatio: "320/100" }, // Mobile Banner
  },
  // Vertical Ads (Left & Right Sidebars) - Same dimensions for both
  vertical: {
    desktop: { width: 300, height: 600, aspectRatio: "300/600" }, // Half Page - Same for left and right
    tablet: { width: 300, height: 600, aspectRatio: "300/600" }, // Half Page - Same for left and right
    mobile: { width: 300, height: 600, aspectRatio: "300/600" }, // Half Page - Same for left and right
  },
};

// Unified Ad Slot Component with TechCrunch-style layout
function TechCrunchAdSlot({
  ad,
  orientation = "horizontal",
  position = "top",
  className = "",
  onClick,
  agentId,
  onImpression,
  width = 300,
  height = 600,
}) {
  const t = useTranslations("Homepage.agent.ads");
  const adRef = useAdImpression(ad, agentId, onImpression);

  if (!ad || (!ad.image && !ad.video)) return null;

  const isHorizontal = orientation === "horizontal";
  // const dimensions = isHorizontal ? AD_DIMENSIONS.horizontal : AD_DIMENSIONS.vertical;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Ad clicked in TechCrunchAdSlot", { ad, onClick: !!onClick });
    if (onClick) {
      onClick(ad);
    }
  };

  return (
    <div
      ref={adRef}
      onClick={handleClick}
      className={cn(
        "block relative overflow-hidden group bg-slate-900 cursor-pointer",
        "transition-all duration-300 hover:shadow-2xl",
        className,
      )}
      style={{
        width,
        height,
        minWidth: width,
        minHeight: height,
      }}
    >
      {/* Media Background */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
          <AdMedia ad={ad} priority={position === "top"} />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Sponsored Label - TechCrunch Style */}
      <div className="absolute top-2 right-2 z-10">
        <span className="px-2 py-0.5 bg-slate-800/90 backdrop-blur-sm text-slate-300 text-[10px] font-semibold uppercase tracking-wider border border-slate-700/50">
          {t("sponsored")}
        </span>
      </div>

      {/* Content Overlay */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end",
          isHorizontal ? "p-4 md:p-6" : "p-4",
        )}
      >
        <div className="space-y-2">
          {ad.businessType && (
            <span className="inline-block px-2 py-0.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wide">
              {ad.businessType}
            </span>
          )}

          <h3
            className={cn(
              "font-bold text-white leading-tight line-clamp-2",
              isHorizontal ? "text-lg md:text-xl" : "text-base",
            )}
          >
            {ad.title}
          </h3>

          {isHorizontal && (
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2 hidden md:block">
              {ad.tagline || ad.description}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors">
              {ad.cta || t("viewOffer")}
              <ArrowUpRight className="w-3 h-3" />
            </div>

            {ad.city && (
              <span className="text-white/70 text-[10px] font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {ad.city}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PREMIUM AD COMPONENTS (TechCrunch Layout) ---

const HORIZONTAL_AD_WIDTH = 900;
const HORIZONTAL_AD_HEIGHT = 220;
const VERTICAL_AD_WIDTH = 250;
const VERTICAL_AD_HEIGHT = 600;

export function TopBannerAd({ ad, onClick, agentId, onImpression }) {
  if (!ad || (!ad.image && !ad.video)) return null;

  return (
    <div className="w-full mb-8 flex justify-center">
      <div style={{ width: HORIZONTAL_AD_WIDTH, height: HORIZONTAL_AD_HEIGHT }}>
        <TechCrunchAdSlot
          ad={ad}
          orientation="horizontal"
          position="top"
          onClick={onClick}
          agentId={agentId}
          onImpression={onImpression}
          width={HORIZONTAL_AD_WIDTH}
          height={HORIZONTAL_AD_HEIGHT}
        />
      </div>
    </div>
  );
}

export function SidebarAd({ ad, placement, onClick, agentId, onImpression }) {
  if (!ad || (!ad.image && !ad.video)) return null;

  return (
    <div className="w-full mb-6 flex justify-center">
      <div style={{ width: VERTICAL_AD_WIDTH, height: VERTICAL_AD_HEIGHT }}>
        <TechCrunchAdSlot
          ad={ad}
          orientation="vertical"
          position={placement}
          onClick={onClick}
          agentId={agentId}
          onImpression={onImpression}
          width={VERTICAL_AD_WIDTH}
          height={VERTICAL_AD_HEIGHT}
        />
      </div>
    </div>
  );
}

export function InlineAd({ ad, onClick, agentId, onImpression }) {
  if (!ad || (!ad.image && !ad.video)) return null;

  return (
    <div className="col-span-1 flex justify-center">
      <div style={{ width: VERTICAL_AD_WIDTH, height: VERTICAL_AD_HEIGHT }}>
        <TechCrunchAdSlot
          ad={ad}
          orientation="vertical"
          position="inline"
          onClick={onClick}
          agentId={agentId}
          onImpression={onImpression}
          width={VERTICAL_AD_WIDTH}
          height={VERTICAL_AD_HEIGHT}
        />
      </div>
    </div>
  );
}

export function BottomBannerAd({ ad, onClick, agentId, onImpression }) {
  if (!ad || (!ad.image && !ad.video)) return null;

  return (
    <div className="w-full mt-6 mb-8 flex justify-center px-4">
      <div style={{ width: HORIZONTAL_AD_WIDTH, height: HORIZONTAL_AD_HEIGHT }}>
        <TechCrunchAdSlot
          ad={ad}
          orientation="horizontal"
          position="bottom"
          onClick={onClick}
          agentId={agentId}
          onImpression={onImpression}
          width={HORIZONTAL_AD_WIDTH}
          height={HORIZONTAL_AD_HEIGHT}
        />
      </div>
    </div>
  );
}

// --- MAIN WRAPPER SECTION ---

export function PaidAdsSection({ ads = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const topAds = ads.filter((a) => a.placement === "top");
  const rightAds = ads.filter((a) => a.placement === "right");
  const leftAds = ads.filter((a) => a.placement === "left");
  const inlineAds = ads.filter((a) => a.placement === "inline");
  const bottomAds = ads.filter((a) => a.placement === "bottom");

  useEffect(() => {
    if (topAds.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % topAds.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [topAds.length]);

  return (
    <div className="w-full">
      <TopBannerAd ad={topAds[activeIndex] || topAds[0]} />
      {/* 
         Please Note: 
         - Sidebar and Inline Ads are now intended to be rendered *inside* the main layout grids 
         of the parent page for better responsiveness.
         - This wrapper is kept for backward compatibility if needed, but the parent page 
         should ideally pick components individually.
       */}
    </div>
  );
}
