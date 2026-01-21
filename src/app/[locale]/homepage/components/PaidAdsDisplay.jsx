"use client";

import { ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
 * Shared Wrapper for Forbes-style "ADVERTISEMENT" labeling.
 */
function AdLabel() {
    return (
        <div className="flex items-center justify-center gap-3 py-2 select-none opacity-50">
            <div className="h-px w-6 bg-slate-300" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                ADVERTISEMENT
            </span>
            <div className="h-px w-6 bg-slate-300" />
        </div>
    );
}

// --- FORBES INSPIRED COMPONENTS ---

// --- FORBES INSPIRED COMPONENTS (PREMIERE DARK THEME) ---

export function TopBannerAd({ ad }) {
    if (!ad) return null;

    return (
        <div className="w-full mb-12">
            <AdLabel />
            <a
                href={ad.redirectUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full max-w-[1100px] mx-auto bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all group overflow-hidden rounded-xl"
            >
                <div className="flex flex-col md:flex-row max-h-60">
                    <div className="relative w-full md:w-1/3 h-32 md:h-auto overflow-hidden shrink-0">
                        <img
                            src={getAdImage(ad.image)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                            alt="leaderboard"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-transparent to-transparent md:bg-linear-to-l" />
                    </div>
                    <div className="flex-1 px-6 py-4 flex flex-col justify-center bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="text-4xl font-serif">"</span>
                        </div>

                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1.5 block items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            {ad.businessType || "Sponsored Highlight"}
                        </span>
                        <h3 className="text-xl font-serif text-slate-50 leading-tight mb-2 group-hover:text-white transition-colors">
                            {ad.title}
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="h-8 px-5 bg-white text-slate-900 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors">
                                {ad.cta || "Experience Now"}
                            </div>
                            <span className="text-[10px] text-slate-400 italic">
                                {ad.city && `Exclusive for ${ad.city}`}
                            </span>
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
        <div className={cn("w-full mb-10 sticky top-28")}>
            <AdLabel />
            <a
                href={ad.redirectUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-[300px] mx-auto min-h-[250px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/40 hover:scale-[1.02] transition-all duration-300 group relative ring-1 ring-white/10"
            >
                <div
                    className="relative w-full h-full flex flex-col"
                    style={{ aspectRatio: "300/250" }}
                >
                    {/* Image Section */}
                    <div className="absolute inset-0 bg-slate-950">
                        <img
                            src={getAdImage(ad.image)}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000"
                            alt="sidebar promotion"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/20 to-transparent" />
                    </div>

                    {/* Overlay Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                        <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2 block items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Sponsored
                            </span>
                            <h4 className="text-xl font-serif text-white leading-tight mb-4 drop-shadow-md line-clamp-2">
                                {ad.title}
                            </h4>
                            <div className="h-10 w-full bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all rounded-full">
                                {ad.cta || "View Promo"}
                            </div>
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
        <div className="w-full my-12">
            <AdLabel />
            <a
                href={ad.redirectUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-slate-900 border border-slate-800 group transition-all hover:bg-slate-950 hover:border-amber-500/30 rounded-xl overflow-hidden shadow-xl"
            >
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-stretch">
                    {/* Left Visual */}
                    <div className="md:w-[280px] shrink-0 relative bg-slate-950 flex items-center justify-center p-6 border-r border-slate-800">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-slate-800/50 to-transparent opacity-50" />
                        <img
                            src={getAdImage(ad.image)}
                            className="relative z-10 max-h-[140px] w-auto object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                            alt="native content"
                        />
                    </div>

                    <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative">
                        <div className="mb-3 flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase tracking-widest border border-amber-500/20">
                                Promoted
                            </span>
                            <div className="h-px flex-1 bg-slate-800" />
                        </div>

                        <h3 className="text-2xl md:text-3xl font-serif text-white leading-snug mb-2 group-hover:text-amber-50 transition-colors">
                            {ad.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-xl">
                            {ad.tagline ||
                                "Discover premium services tailored for our marketplace. Verified excellence."}
                            <span className="text-slate-600 mx-2">|</span>
                            <span className="text-slate-500 italic">
                                Available in {ad.city || "Global"}
                            </span>
                        </p>

                        <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                            <span>Read Full Story</span>
                            <ChevronRight className="w-4 h-4 text-amber-500" />
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
}

export function BottomBannerAd({ ad }) {
    if (!ad) return null;

    return (
        <div className="w-full mt-20 mb-10 px-6">
            <AdLabel />
            <a
                href={ad.redirectUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block max-w-6xl mx-auto group"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl">
                    <div className="flex items-center gap-6 flex-1 text-center md:text-left">
                        <div className="h-20 w-20 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow-lg ring-1 ring-white/10">
                            <img
                                src={getAdImage(ad.image)}
                                className="max-h-full max-w-full object-contain"
                                alt="footer partner"
                            />
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
                                Premium Partner
                            </span>
                            <h4 className="text-2xl font-serif text-white">{ad.title}</h4>
                            <p className="text-slate-400 text-xs">
                                Visiting from {ad.city || "Global Partner Network"}
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <div className="h-10 px-6 rounded bg-white text-slate-950 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-400 transition-colors shadow-lg">
                            <span>Visit Site</span>
                            <ExternalLink className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
}

// --- MAIN WRAPPER SECTION ---

export function PaidAdsSection({ ads = [] }) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Grouping logic for differentiated rendering
    const topAds = ads.filter((a) => a.placement === "top");
    const rightAds = ads.filter((a) => a.placement === "right");
    const leftAds = ads.filter((a) => a.placement === "left");
    const inlineAds = ads.filter((a) => a.placement === "inline");
    const bottomAds = ads.filter((a) => a.placement === "bottom");

    // Editorial rotation cycle (7s)
    useEffect(() => {
        if (topAds.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % topAds.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [topAds.length]);

    return (
        <div className="w-full">
            {/* 1. Header Leaderboard */}
            <TopBannerAd ad={topAds[activeIndex] || topAds[0]} />

            <div className="flex flex-col xl:flex-row gap-8 items-start">
                {/* 3. Left Skyscraper */}
                {leftAds.length > 0 && (
                    <div className="hidden xl:block w-40 shrink-0 sticky top-28">
                        <SidebarAd ad={leftAds[0]} placement="left" />
                    </div>
                )}

                {/* Core Marketplace Flow with Inline Ads */}
                <div className="flex-1 w-full space-y-12">
                    {/* Main marketplace content is injected here via agent.jsx */}

                    {/* 4. Native Inline Placement */}
                    {inlineAds.length > 0 && <InlineAd ad={inlineAds[0]} />}
                </div>

                {/* 2. Right Rectangle (Sticky) */}
                {rightAds.length > 0 && (
                    <div className="hidden xl:block w-[300px] shrink-0">
                        <SidebarAd ad={rightAds[0]} placement="right" />
                    </div>
                )}
            </div>

            {/* 5. Footer Sponsor Strip */}
            <BottomBannerAd ad={bottomAds[0]} />
        </div>
    );
}
