"use client";

import { ExternalLink, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image";

// --- HELPERS ---
let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
baseUrl = baseUrl.replace(/\/v1\/?$/, "");

const getAdImage = (path) => {
    if (!path)
        return "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80";
    if (path.startsWith("http")) return path;
    if (path.startsWith("data:")) return path;

    const cleanBase = baseUrl.replace(/\/+$/, "");
    const cleanPath = path.toString().replace(/^\/+/, "");
    return `${cleanBase}/${cleanPath}`;
};

/**
 * Modern "Sponsored" Label - Subtle & Clean
 */
function AdLabel({ className }) {
    return (
        <div className={cn("flex items-center gap-1.5 opacity-70 mb-2", className)}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200/50">
                Sponsored
            </span>
        </div>
    );
}

// --- PREMIUM AD COMPONENTS ---

export function TopBannerAd({ ad }) {
    if (!ad) return null;

    return (
        <div className="w-full mb-8 lg:mb-12 group cursor-pointer">
            <a
                href={ad.redirectUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative w-full h-[320px] md:h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 ring-1 ring-black/5"
            >
                {/* Background Image with Scale Effect */}
                <div className="absolute inset-0 bg-slate-100">
                    <img
                        src={getAdImage(ad.image)}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt={ad.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end items-start md:justify-end">
                    <div className="absolute top-6 right-6">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10 shadow-sm">
                            {ad.businessType || "Featured Partner"}
                        </span>
                    </div>

                    <div className="max-w-2xl space-y-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <BadgeLabel text="Sponsored" />
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-sm">
                            {ad.title}
                        </h2>
                        <p className="text-white/90 text-lg font-medium leading-relaxed max-w-xl">
                            {ad.description || ad.tagline}
                        </p>

                        <div className="pt-4 flex items-center gap-4">
                            <span className="h-12 px-8 bg-white text-slate-900 rounded-full flex items-center justify-center text-sm font-bold tracking-wide hover:bg-slate-100 transition-colors shadow-lg shadow-black/20">
                                {ad.cta || "Learn More"}
                            </span>
                            {ad.city && (
                                <span className="text-white/70 text-sm font-medium flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Available in {ad.city}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
}

export function SidebarAd({ ad, placement }) {
    if (!ad) return null;

    return (
        <div className={cn("w-full mb-8 relative group")}>
            <a
                href={ad.redirectUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-slate-100 border border-slate-100"
            >
                <div className="relative aspect-[4/5] overflow-hidden">
                    <span className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider rounded border border-white/10">
                        Ad
                    </span>
                    <img
                        src={getAdImage(ad.image)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={ad.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <h4 className="text-lg font-bold leading-snug mb-1">{ad.title}</h4>
                        <p className="text-white/80 text-xs line-clamp-2 mb-3">{ad.tagline}</p>
                        <div className="flex items-center text-xs font-bold text-white/90 gap-1 group-hover:gap-2 transition-all">
                            {ad.cta || "View Offer"} <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
}

export function InlineAd({ ad }) {
    if (!ad) return null;

    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-1 h-full min-h-[300px]">
            <a
                href={ad.redirectUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-full flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-primary/20 hover:ring-2 hover:ring-primary/5 transition-all group relative"
            >
                <div className="relative h-48 overflow-hidden">
                    <div className="absolute top-3 right-3 z-10">
                        <span className="px-2 py-0.5 bg-white/90 backdrop-blur text-slate-500 text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm border border-slate-100">
                            Sponsored
                        </span>
                    </div>
                    <img
                        src={getAdImage(ad.image)}
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                        alt={ad.title}
                    />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                            {ad.title}
                        </h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed flex-1">
                        {ad.tagline || ad.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{ad.businessType}</span>
                        <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                            Open <ExternalLink className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            </a>
        </div>
    );
}

export function BottomBannerAd({ ad }) {
    if (!ad) return null;

    return (
        <div className="w-full mt-8 mb-12 px-6 lg:px-10 max-w-[1600px] mx-auto">
            {/* Top Label */}
            <div className="flex items-center gap-2 mb-3 opacity-60">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                    Sponsored
                </span>
                <span className="h-px w-8 bg-slate-300"></span>
            </div>

            <a
                href={ad.redirectUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full relative overflow-hidden rounded-[2rem] group shadow-2xl transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
            >
                <div className="absolute inset-0 bg-[#0B1120]" />

                {/* Ultra Compact Slim Layout */}
                <div className="relative flex flex-col md:flex-row items-center h-full">
                    {/* Image Section - Much smaller */}
                    <div className="shrink-0 w-full md:w-[240px] lg:w-[280px] self-stretch relative overflow-hidden">
                        <div className="absolute top-2 left-2 z-10">
                            <span className="px-1.5 py-px bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-wider rounded border border-white/10">
                                Ad
                            </span>
                        </div>
                        <img
                            src={getAdImage(ad.image)}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={ad.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0B1120]/30 md:to-[#0B1120]" />
                    </div>

                    <div className="flex-1 px-4 py-3 md:px-6 md:py-2 text-center md:text-left flex flex-col justify-center min-h-[100px]">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-amber-500 text-[8px] font-bold uppercase tracking-[0.2em] opacity-90">Premium</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                            <div className="space-y-1 flex-1">
                                <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-none">
                                    {ad.title}
                                </h3>
                                <p className="text-slate-400 text-xs font-medium leading-tight line-clamp-1">
                                    {ad.description || "Visit our exclusive partner for premium offers."}
                                </p>
                            </div>

                            <div className="shrink-0 pt-2 md:pt-0">
                                <div className="h-7 px-4 bg-white hover:bg-slate-50 text-slate-900 rounded-lg inline-flex items-center justify-center font-bold text-[10px] tracking-wide gap-1.5 transition-all shadow-sm hover:-translate-y-px">
                                    {ad.cta || "Open"} <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
}

function BadgeLabel({ text }) {
    return (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white mb-2 border border-white/10">
            {text}
        </span>
    )
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
