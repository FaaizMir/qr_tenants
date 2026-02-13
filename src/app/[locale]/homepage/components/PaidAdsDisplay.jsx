"use client";

import {
  ExternalLink,
  ChevronRight,
  Info,
  ArrowUpRight,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { getImageUrl } from "@/lib/utils/imageUtils";

// Base URL without /api/v1 for media files
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/v1", "") ||
  "https://qr-review.mustservices.io/backend/api";

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

  // Construct media URL with base URL - prioritize actual video/image presence over isVideo flag
  const mediaUrl = ad.video
    ? `${BASE_URL}${ad.video}`
    : ad.image
      ? `${BASE_URL}${ad.image}`
      : "";

  const actualIsVideo = !!ad.video; // Determine video status from actual video path

  console.log("ad.video", ad.video);
  console.log("ad.image", ad.image);
  console.log("ad.isVideo", ad.isVideo);
  console.log("actualIsVideo", actualIsVideo);
  console.log("BASE_URL", BASE_URL);
  console.log("mediaUrl", mediaUrl);

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
          onError={(e) => {
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
function AdLabel({ className }) {
  const t = useTranslations("Homepage.agent.ads");

  return (
    <div className={cn("flex items-center gap-1.5 opacity-70 mb-2", className)}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-sm">
        {t("sponsored")}
      </span>
    </div>
  );
}

// --- PREMIUM AD COMPONENTS ---

export function TopBannerAd({ ad }) {
  const t = useTranslations("Homepage.agent.ads");

  if (!ad || (!ad.image && !ad.video)) return null;

  return (
    <div className="w-full mb-8 lg:mb-12 group">
      <Link
        href={ad.redirectUrl || "#"}
        target={ad.redirectUrl?.startsWith("http") ? "_blank" : undefined}
        className="block relative w-full h-[280px] sm:h-[350px] md:h-[420px] lg:h-[480px] rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition-shadow duration-500"
      >
        {/* Background Image/Video with Scale Effect */}
        <div className="absolute inset-0 bg-slate-900">
          <div className="relative w-full h-full transition-transform duration-1000 group-hover:scale-105">
            <AdMedia ad={ad} priority={true} />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 p-4 sm:p-6 md:p-10 lg:p-14 flex flex-col justify-end items-start">
          <div className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8">
            <span className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-white/10 backdrop-blur-xl text-white text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-full shadow-2xl">
              {ad.businessType || t("featuredPartner")}
            </span>
          </div>

          <div className="max-w-2xl space-y-3 sm:space-y-4 md:space-y-6 animate-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center gap-2 sm:gap-3">
              <BadgeLabel text={t("sponsored")} />
              <div className="h-px w-6 sm:w-8 bg-white/30" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
              {ad.title}
            </h2>

            <p className="text-white/80 text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed max-w-xl line-clamp-2">
              {ad.description || ad.tagline}
            </p>

            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
              <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-primary text-white rounded-full font-bold text-xs sm:text-sm shadow-xl shadow-primary/30 group/btn transition-all hover:scale-105 active:scale-95">
                {ad.cta || t("experienceNow")}
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </div>

              {ad.city && (
                <span className="text-white/60 text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  {t("availableIn", { city: ad.city })}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function SidebarAd({ ad, placement }) {
  const t = useTranslations("Homepage.agent.ads");

  if (!ad || (!ad.image && !ad.video)) return null;

  return (
    <div className={cn("w-full mb-6 lg:mb-8 relative group")}>
      <Link
        href={ad.redirectUrl || "#"}
        target={ad.redirectUrl?.startsWith("http") ? "_blank" : undefined}
        className="block bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-[0_6px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500"
      >
        <div className="relative aspect-3/4 lg:aspect-4/5 overflow-hidden">
          <span className="absolute top-2 lg:top-3 left-2 lg:left-3 z-10 px-2 lg:px-2.5 py-0.5 lg:py-1 bg-black/60 backdrop-blur-md text-white text-[8px] lg:text-[9px] font-bold uppercase tracking-wider rounded">
            {t("ad")}
          </span>
          <div className="transition-transform duration-700 group-hover:scale-105">
            <AdMedia ad={ad} />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-5 text-white">
            <h4 className="text-sm lg:text-lg font-bold leading-snug mb-1">
              {ad.title}
            </h4>
            <p className="text-white/80 text-[10px] lg:text-xs line-clamp-2 leading-relaxed">
              {ad.tagline}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function InlineAd({ ad }) {
  const t = useTranslations("Homepage.agent.ads");

  if (!ad || (!ad.image && !ad.video)) return null;

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-1 h-full min-h-[280px] sm:min-h-[300px]">
      <Link
        href={ad.redirectUrl || "#"}
        target={ad.redirectUrl?.startsWith("http") ? "_blank" : undefined}
        className="h-full flex flex-col bg-white shadow-[0_6px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-xl lg:rounded-2xl overflow-hidden group relative transition-all duration-500 hover:-translate-y-1"
      >
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
            <span className="px-2 sm:px-2.5 py-0.5 bg-white/90 backdrop-blur text-slate-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
              {t("sponsored")}
            </span>
          </div>
          <div className="transition-transform duration-700 group-hover:scale-110">
            <AdMedia ad={ad} showPlayIcon={ad.isVideo} />
          </div>
        </div>
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
              {ad.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4 line-clamp-3 leading-relaxed flex-1">
            {ad.tagline || ad.description}
          </p>
          {ad.businessType && (
            <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100">
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wide">
                {ad.businessType}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export function BottomBannerAd({ ad }) {
  const t = useTranslations("Homepage.agent.ads");

  if (!ad || (!ad.image && !ad.video)) return null;

  return (
    <div className="w-full mt-6 sm:mt-8 mb-8 sm:mb-12 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto">
      {/* Top Label */}
      <div className="flex items-center gap-2 mb-2 sm:mb-3 opacity-60">
        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-widest">
          {t("sponsored")}
        </span>
        <span className="h-px w-6 sm:w-8 bg-slate-300"></span>
      </div>

      <Link
        href={ad.redirectUrl || "#"}
        target={ad.redirectUrl?.startsWith("http") ? "_blank" : undefined}
        className="block w-full relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-4xl group shadow-xl hover:shadow-2xl transition-all duration-500"
      >
        <div className="absolute inset-0 bg-[#0B1120]" />

        {/* Responsive Layout */}
        <div className="relative flex flex-col sm:flex-row items-center h-full">
          {/* Image/Video Section */}
          <div className="shrink-0 w-full sm:w-48 md:w-60 lg:w-[280px] h-32 sm:h-auto sm:self-stretch relative overflow-hidden">
            <div className="absolute top-2 left-2 z-10">
              <span className="px-1.5 sm:px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-wider rounded">
                {t("ad")}
              </span>
            </div>
            <div className="transition-transform duration-700 group-hover:scale-110">
              <AdMedia ad={ad} />
            </div>
            <div className="absolute inset-0 bg-linear-to-t sm:bg-linear-to-r from-[#0B1120] via-[#0B1120]/60 sm:via-transparent to-transparent" />
          </div>

          <div className="flex-1 px-4 py-3 sm:px-5 md:px-6 sm:py-4 md:py-2 text-center sm:text-left flex flex-col justify-center min-h-[80px] sm:min-h-[100px]">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1">
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-500 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] opacity-90">
                {t("premiumLabel")}
              </span>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <h3 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight leading-tight">
                {ad.title}
              </h3>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium leading-tight line-clamp-1 sm:line-clamp-2">
                {ad.description || t("visitExclusivePartner")}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function BadgeLabel({ text }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white mb-2 border border-white/10">
      {text}
    </span>
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
