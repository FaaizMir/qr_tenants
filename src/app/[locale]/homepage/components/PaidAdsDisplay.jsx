"use client";

import { ExternalLink, ChevronRight, Info, ArrowUpRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

// --- HELPERS ---
let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
// Remove trailing '/api/v1' or '/v1' if present
baseUrl = baseUrl.replace(/\/(api\/)?v1\/?$/, "");

const getAdImage = (path) => {
  if (!path)
    return "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80";
  if (path.startsWith("http")) return path;
  if (path.startsWith("data:")) return path;

  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.toString().replace(/^\/+/, "");
  const finalUrl = `${cleanBase}/${cleanPath}`;
  console.log("Ad Media URL:", finalUrl);
  return finalUrl;
};

const AdMedia = ({ ad, className, showPlayIcon = false }) => {
  const mediaUrl = ad.isVideo ? getAdImage(ad.video) : getAdImage(ad.image);
  
  if (ad.isVideo && ad.video) {
    console.log("Rendering video ad:", mediaUrl);
    return (
      <div className="relative w-full h-full">
        <video
          key={mediaUrl}
          className={cn("w-full h-full object-cover", className)}
          autoPlay
          muted
          loop
          playsInline
          onError={(e) => {
            console.error("Video load error:", e);
            console.error("Video URL that failed:", mediaUrl);
          }}
          onLoadStart={() => console.log("Video loading started:", mediaUrl)}
          onCanPlay={() => console.log("Video can play now")}
        >
          <source src={mediaUrl} type="video/mp4" />
          <source src={mediaUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        {showPlayIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Image
      src={mediaUrl}
      className={cn("object-cover", className)}
      alt={ad.title}
      fill
      unoptimized
    />
  );
};

/**
 * Modern "Sponsored" Label - Subtle & Clean
 */
function AdLabel({ className }) {
  const t = useTranslations("homepage.agent.ads");
  
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
  const t = useTranslations("homepage.agent.ads");
  
  if (!ad) return null;

  return (
    <div className="w-full mb-8 lg:mb-12 group">
      <Link
        href={ad.redirectUrl || "#"}
        target={ad.redirectUrl?.startsWith("http") ? "_blank" : undefined}
        className="block relative w-full h-[350px] md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      >
        {/* Background Image/Video with Scale Effect */}
        <div className="absolute inset-0 bg-slate-100">
          <div className="relative w-full h-full transition-transform duration-1000 group-hover:scale-110">
            <AdMedia ad={ad} />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-black/70 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end items-start">
          <div className="absolute top-8 right-8">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-xl text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-2xl">
              {ad.businessType || t("featuredPartner")}
            </span>
          </div>

          <div className="max-w-2xl space-y-6 animate-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center gap-3">
              <BadgeLabel text={t("sponsored")} />
              <div className="h-px w-8 bg-white/30" />
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
              {ad.title}
            </h2>

            <p className="text-white/80 text-lg md:text-xl font-medium leading-relaxed max-w-xl line-clamp-2">
              {ad.description || ad.tagline}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/30 group/btn transition-all hover:scale-105 active:scale-95">
                {ad.cta || t("experienceNow")}
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </div>

              {ad.city && (
                <span className="text-white/60 text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
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
  const t = useTranslations("homepage.agent.ads");
  
  if (!ad) return null;

  return (
    <div className={cn("w-full mb-8 relative group")}>
      <div className="block bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
        <div className="relative aspect-4/5 overflow-hidden">
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider rounded">
            {t("ad")}
          </span>
          <AdMedia ad={ad} />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80" />

          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h4 className="text-lg font-bold leading-snug mb-1">{ad.title}</h4>
            <p className="text-white/80 text-xs line-clamp-2">{ad.tagline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InlineAd({ ad }) {
  const t = useTranslations("homepage.agent.ads");
  
  if (!ad) return null;

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-1 h-full min-h-[300px]">
      <div className="h-full flex flex-col bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden group relative transition-all duration-500">
        <div className="relative h-48 overflow-hidden">
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-0.5 bg-white/90 backdrop-blur text-slate-500 text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
              {t("sponsored")}
            </span>
          </div>
          <AdMedia ad={ad} showPlayIcon={ad.isVideo} />
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-slate-900 leading-tight">
              {ad.title}
            </h3>
          </div>
          <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed flex-1">
            {ad.tagline || ad.description}
          </p>
          {ad.businessType && (
            <div className="mt-auto pt-4">
              <span className="text-xs font-bold text-slate-700">
                {ad.businessType}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BottomBannerAd({ ad }) {
  const t = useTranslations("homepage.agent.ads");
  
  if (!ad) return null;

  return (
    <div className="w-full mt-8 mb-12 px-6 lg:px-10 max-w-[1600px] mx-auto">
      {/* Top Label */}
      <div className="flex items-center gap-2 mb-3 opacity-60">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
          {t("sponsored")}
        </span>
        <span className="h-px w-8 bg-slate-300"></span>
      </div>

      <div className="block w-full relative overflow-hidden rounded-4xl group shadow-2xl">
        <div className="absolute inset-0 bg-[#0B1120]" />

        {/* Ultra Compact Slim Layout */}
        <div className="relative flex flex-col md:flex-row items-center h-full">
          {/* Image Section - Much smaller */}
          <div className="shrink-0 w-full md:w-60 lg:w-[280px] self-stretch relative overflow-hidden">
            <div className="absolute top-2 left-2 z-10">
              <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-wider rounded">
                {t("ad")}
              </span>
            </div>
            <AdMedia ad={ad} />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-[#0B1120]/30 md:to-[#0B1120]" />
          </div>

          <div className="flex-1 px-4 py-3 md:px-6 md:py-2 text-center md:text-left flex flex-col justify-center min-h-[100px]">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-500 text-[8px] font-bold uppercase tracking-[0.2em] opacity-90">
                {t("premiumLabel")}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-none">
                {ad.title}
              </h3>
              <p className="text-slate-400 text-xs font-medium leading-tight line-clamp-1">
                {ad.description ||
                  t("visitExclusivePartner")}
              </p>
            </div>
          </div>
        </div>
      </div>
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
