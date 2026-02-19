"use client";
import {
  Search,
  MapPin,
  Store,
  Shield,
  TrendingUp,
  Loader2,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { InlineAd } from "./PaidAdsDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTranslations } from "next-intl";

// --- HELPERS ---
// --- HELPERS ---
const CATEGORY_IMAGES = {
  retail: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop", // Shop
    "https://images.unsplash.com/photo-1472851294608-41551b4183d2?q=80&w=1000&auto=format&fit=crop", // Marketplace
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?q=80&w=1000&auto=format&fit=crop", // Boutique
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1000&auto=format&fit=crop", // Department Store
  ],
  food: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", // Restaurant
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80", // Cafe
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80", // Bar
    "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80", // Food plating
  ],
  health: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80", // Gym
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80", // Gym bright
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80", // Fitness
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80", // Healthcare/Medical
  ],
  education: [
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b955?auto=format&fit=crop&w=800&q=80", // Classroom bright
    "https://images.unsplash.com/photo-1599687351724-dfa3c4ff81b1?auto=format&fit=crop&w=800&q=80", // University Students
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80", // Study Kids
    "https://images.unsplash.com/photo-1568266209565-38dc2f97658c?auto=format&fit=crop&w=800&q=80", // Whiteboard
  ],
  hospitality: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", // Hotel
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80", // Resort
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", // Hotel room
    "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80", // Hotel outdoors
  ],
  technology: [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80", // Tech workspace
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80", // Blue tech/data
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80", // Circuits
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1000&q=80", // Laptop and code
  ],
  services: [
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80", // Office Meeting
    "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=800&q=80", // Corporate Handshake
    "https://images.unsplash.com/photo-1665686376173-ada7a0031a85?auto=format&fit=crop&w=800&q=80", // Professional Consulting
  ],
  default: [
    "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80", // General
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", // Office
  ],
};

function getCategoryImage(category, id) {
  // Normalize category
  const normalizedCat = (category || "").toLowerCase();

  // Find key that partially matches
  let key = "default";
  if (
    normalizedCat.includes("retail") ||
    normalizedCat.includes("shop") ||
    normalizedCat.includes("fashion") ||
    normalizedCat.includes("clothing") ||
    normalizedCat.includes("boutique") ||
    normalizedCat.includes("store") ||
    normalizedCat.includes("industry") ||
    normalizedCat.includes("industory")
  )
    key = "retail";
  else if (
    normalizedCat.includes("food") ||
    normalizedCat.includes("beverage") ||
    normalizedCat.includes("restaurant") ||
    normalizedCat.includes("cafe") ||
    normalizedCat.includes("dining")
  )
    key = "food";
  else if (
    normalizedCat.includes("health") ||
    normalizedCat.includes("fitness") ||
    normalizedCat.includes("gym") ||
    normalizedCat.includes("medical") ||
    normalizedCat.includes("care") ||
    normalizedCat.includes("wellness")
  )
    key = "health";
  else if (
    normalizedCat.includes("education") ||
    normalizedCat.includes("university") ||
    normalizedCat.includes("school") ||
    normalizedCat.includes("training") ||
    normalizedCat.includes("college")
  )
    key = "education";
  else if (
    normalizedCat.includes("hospitality") ||
    normalizedCat.includes("hotel") ||
    normalizedCat.includes("resort") ||
    normalizedCat.includes("travel") ||
    normalizedCat.includes("lodging")
  )
    key = "hospitality";
  else if (
    normalizedCat.includes("tech") ||
    normalizedCat.includes("software") ||
    normalizedCat.includes("digital") ||
    normalizedCat.includes("computer") ||
    normalizedCat.includes("electronics") ||
    normalizedCat.includes(" it") ||
    normalizedCat.includes("it ") ||
    normalizedCat === "it"
  )
    key = "technology";
  else if (
    normalizedCat.includes("service") ||
    normalizedCat.includes("professional") ||
    normalizedCat.includes("consulting") ||
    normalizedCat.includes("agency")
  )
    key = "services";

  const images = CATEGORY_IMAGES[key] || CATEGORY_IMAGES.default;

  // Deterministic selection based on ID
  // If id is undefined/null, use a random one based on random number (not ideal for SSR hydration but fallback)
  const seed = id
    ? String(id)
        .split("")
        .reduce((a, b) => a + b.charCodeAt(0), 0)
    : Math.floor(Math.random() * 1000);
  return images[seed % images.length];
}

export function MarketplaceFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedRegion,
  setSelectedRegion,
  expiringSoon,
  setExpiringSoon,
  categories,
  cities,
  handleGetCoupon,
}) {
  const t = useTranslations("Homepage.agent.marketplace");

  return (
    <div className="sticky top-20 z-40 mb-8">
      <div className="bg-white/80 backdrop-blur-xl p-3 md:p-4 rounded-2xl md:rounded-full shadow-xl shadow-slate-200/50 border border-white/50 ring-1 ring-slate-100 flex flex-col md:flex-row gap-3 items-center max-w-6xl mx-auto transition-all">
        {/* Search */}
        <div className="flex-1 relative w-full group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-100 p-1.5 rounded-full text-slate-400 group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
            <Search className="h-4 w-4" />
          </div>

          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-12 h-12 rounded-full border bg-slate-50 text-base font-medium placeholder:text-slate-400 hover:bg-slate-100/50 focus:outline-none focus-visible:ring-0 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Industry */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger
              className="
            w-full md:w-40 h-11
            rounded-full
            bg-slate-50
            px-4
            text-sm font-medium text-slate-700
            hover:bg-slate-100
            focus:outline-none
            focus:ring-0
            focus-visible:ring-0
            transition-colors
          "
              suppressHydrationWarning
            >
              <SelectValue placeholder={t("industry")} />
            </SelectTrigger>

            <SelectContent className="rounded-xl shadow-md border-slate-200">
              <SelectItem value="all">{t("allIndustries")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City */}
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger
              className="
            w-full md:w-40 h-11
            rounded-full
            bg-slate-50
            px-4
            text-sm font-medium text-slate-700
            hover:bg-slate-100
            focus:outline-none
            focus:ring-0
            focus-visible:ring-0
            transition-colors
          "
              suppressHydrationWarning
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <SelectValue placeholder={t("city")} />
              </div>
            </SelectTrigger>

            <SelectContent className="rounded-xl shadow-md border-slate-200">
              <SelectItem value="all">{t("everywhere")}</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Expiring Soon Toggle */}
          <Button
            variant={expiringSoon ? "default" : "outline"}
            onClick={() => setExpiringSoon(!expiringSoon)}
            className="h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap border-slate-200"
          >
            {expiringSoon ? "Expiring Soon ✓" : "Expiring Soon"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MerchantList({
  merchants,
  selectedMerchantId,
  setSelectedMerchantId,
  loading,
  error,
  page: rawPage,
  totalItems: rawTotalItems,
  hasMore,
  onPageChange,
  ads = [],
  onAdClick,
}) {
  const t = useTranslations("Homepage.agent.marketplace");
  const tDetail = useTranslations("Homepage.agent.merchantDetail");
  const page = Number(rawPage || 1);
  const totalItems = Number(rawTotalItems || 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 min-h-[400px] w-full animate-in fade-in duration-700">
        <div className="relative mb-8">
          {/* Outer Ring */}
          <div className="w-24 h-24 rounded-full border-[3px] border-slate-100 border-t-primary border-r-primary/30 animate-spin" />
          {/* Inner Pulsing Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center animate-pulse shadow-inner border border-slate-100">
              <Store className="w-8 h-8 text-primary/60" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-bold text-slate-900 text-xl tracking-tight">
            {t("loadingMarketplace")}
          </h3>
          <p className="text-slate-400 text-sm font-medium max-w-60 mx-auto leading-relaxed">
            {t("curatingMessage")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-red-50 rounded-3xl border border-red-100">
        <Shield className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-red-900 font-bold text-lg">{t("unableToLoad")}</h3>
        <p className="text-sm font-medium text-red-600/80 mb-6">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          {t("retryConnection")}
        </Button>
      </div>
    );
  }

  // Interleave ads into the merchants list for the grid
  // Strategy: Create a combined array where ads are injected every N items
  const combinedItems = [];
  let adIndex = 0;

  merchants.forEach((merchant, index) => {
    combinedItems.push({ type: "merchant", data: merchant });

    // Inject ad after specific intervals if available
    const AD_INTERVAL = merchants.length < 4 ? 2 : 6;

    if ((index + 1) % AD_INTERVAL === 0 && ads.length > adIndex) {
      combinedItems.push({
        type: "ad",
        data: ads[adIndex],
      });
      adIndex++;
    }
  });

  if (merchants.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-24 bg-white rounded-4xl border border-dashed border-slate-200">
          <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Store className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">
            {t("noMerchantsFound")}
          </h3>
          <p className="text-slate-500">{t("tryAdjustingFilters")}</p>
        </div>

        {/* Pagination for empty results when not on page 1 */}
        {page > 1 && (
          <div className="flex flex-col items-center gap-6 pt-12 pb-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: page }).map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === page ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="icon"
                        className={cn(
                          "w-10 h-10 rounded-xl font-bold transition-all text-sm tracking-tight",
                          page === pageNum
                            ? "bg-primary text-white shadow-lg shadow-primary/25 border-primary scale-110 z-10"
                            : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 shadow-sm",
                        )}
                        onClick={() => onPageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (pageNum === 2 && page > 3) {
                    return (
                      <span
                        key={pageNum}
                        className="px-1 text-slate-400 font-bold"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
                onClick={() => onPageChange(page + 1)}
                disabled={true}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
              {t("pageNoResults", { page })}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Container for Merchants - No Scrolling */}
      <div className="px-1 py-4">
        <div
          className={cn(
            "grid gap-x-4 gap-y-10",
            merchants.length === 1
              ? "grid-cols-1 max-w-2xl mx-auto"
              : merchants.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full",
          )}
        >
          {combinedItems.map((item, idx) => {
            if (item.type === "ad") {
              return (
                <div key={`ad-${idx}`} className="h-full">
                  <InlineAd ad={item.data} onClick={onAdClick} />
                </div>
              );
            }

            const merchant = item.data;
            const isSelected = selectedMerchantId === merchant.id;

            return (
              <div
                key={merchant.id}
                onClick={() => setSelectedMerchantId(merchant.id)}
                className={cn(
                  "group relative bg-white rounded-[2.5rem] overflow-hidden cursor-pointer flex flex-col transition-all duration-500",
                  "shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                  "w-full",
                  isSelected
                    ? "shadow-[0_20px_50px_rgba(0,0,0,0.1)] scale-[1.02]"
                    : "hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2",
                )}
              >
                {/* Cover Image Area */}
                <div
                  className={cn(
                    "relative overflow-hidden bg-slate-200",
                    merchants.length === 1 ? "h-50" : "h-44",
                  )}
                >
                  <Image
                    src={getCategoryImage(merchant.category, merchant.id)}
                    alt={`${merchant.name} cover`}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Featured Badge or Tag */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 hover:bg-white/30 border-none shadow-sm font-semibold text-[10px] uppercase tracking-wider px-3">
                      {merchant.category}
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 right-4 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-white/90 text-[10px] font-semibold uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {merchant.city}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-7 py-8 flex flex-col relative bg-white rounded-b-[2.5rem]">
                  <div className="space-y-1 mb-6 text-left">
                    <h3 className="font-bold text-xl text-slate-900 leading-tight group-hover:text-primary transition-colors">
                      {merchant.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        {tDetail("verifiedMerchant")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">
                        {tDetail("availableDeals")}
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {tDetail("offers", {
                          count: merchant.batches?.length || 0,
                        })}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "secondary"}
                      className={cn(
                        "rounded-2xl font-bold text-[11px] uppercase tracking-wide transition-all h-10 px-6",
                        isSelected
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-slate-50 text-slate-600 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20",
                      )}
                    >
                      {tDetail("details")}{" "}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {(totalItems > 6 || hasMore || page > 1) && !loading && (
        <div className="flex flex-col items-center gap-6 pt-12 pb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-1.5 px-2">
              {Array.from({
                length: Math.max(
                  page,
                  hasMore && totalItems <= page * 6
                    ? page + 1
                    : Math.ceil(totalItems / 6),
                ),
              }).map((_, i) => {
                const pageNum = i + 1;
                const totalPages = Math.max(
                  page,
                  hasMore && totalItems <= page * 6
                    ? page + 1
                    : Math.ceil(totalItems / 6),
                );

                // Only show current, 1st, last, and neighbors
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        "w-10 h-10 rounded-xl font-bold transition-all text-sm tracking-tight",
                        page === pageNum
                          ? "bg-primary text-white shadow-lg shadow-primary/25 border-primary scale-110 z-10"
                          : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 shadow-sm",
                      )}
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (
                  (pageNum === 2 && page > 3) ||
                  (pageNum === totalPages - 1 && page < totalPages - 2)
                ) {
                  return (
                    <span
                      key={pageNum}
                      className="px-1 text-slate-400 font-bold"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasMore}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {totalItems > 0 && (
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
              {(page - 1) * 6 >= totalItems ||
              (totalItems <= page * 6 && hasMore)
                ? t("showingPage", { page })
                : t("showing", {
                    start: (page - 1) * 6 + 1,
                    end: Math.min(page * 6, totalItems),
                    total: totalItems,
                  })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function MerchantDetail({ activeMerchant, handleGetCoupon }) {
  const router = useRouter();
  const tDetail = useTranslations("Homepage.agent.merchantDetail");

  // Mobile/Tablet View handled via simple conditionally rendered sheet or similar if needed,
  // but for now keeping the "selected means highlighted" flow.
  // Actually, let's make it a nice Sticky Side Panel for desktop or a Dialog for mobile.
  // Since the parent layout uses a side-by-side flex on large screens, we'll keep the relative structure
  // but make it much nicer.

  if (!activeMerchant) {
    return (
      <div className="hidden lg:flex sticky mt-5  w-full flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white shadow-2xl shadow-slate-200/50 overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-slate-50/50 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center h-66 justify-center">
          <h3 className="font-bold text-slate-900 text-2xl mb-4 tracking-tight">
            {tDetail("readyToExplore")}
          </h3>
          <p className="text-slate-400 max-w-60 text-sm font-medium leading-relaxed">
            {tDetail("clickMerchantPrompt")}{" "}
            <span className="text-primary font-semibold">
              {tDetail("exclusiveCoupons")}
            </span>{" "}
            {tDetail("limitedTimeOffers")}
          </p>

          <div className="mt-10 flex items-center gap-2 opacity-30">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>
    );
  }

  const couponsCount = activeMerchant.batches?.length || 0;

  return (
    <div
      className={cn(
        "bg-white rounded-4xl shadow-2xl shadow-slate-200/50 overflow-hidden sticky mt-5 animate-in slide-in-from-right-10 duration-500 ease-out flex flex-col transition-all h-[777px]",
      )}
    >
      {/* Header */}
      <div className="relative h-48 bg-slate-900 shrink-0">
        <Image
          src={getCategoryImage(activeMerchant.category, activeMerchant.id)}
          className="object-cover opacity-40"
          alt="header"
          fill
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-900/90" />
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20">
            {activeMerchant.category}
          </Badge>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5">
          <div className="pb-1 text-white   ">
            <h2 className="text-2xl md:text-3xl font-bold leading-none mb-2">
              {activeMerchant.name}
            </h2>
            <p className="text-slate-400 text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {activeMerchant.address}
            </p>
          </div>
        </div>
      </div>

      {/* Actionable Content */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="p-6 md:p-8 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              {tDetail("availableCoupons")}
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {tDetail("dealsFound", {
                count: activeMerchant.batches?.length || 0,
              })}
            </span>
          </div>
        </div>

        {/* Scrollable Coupons Section */}
        <div className="px-6 md:px-8 pb-6 md:pb-8 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-slate-400">
          <div className="space-y-6">
            {activeMerchant.batches?.length > 0 ? (
              activeMerchant.batches.map((batch) => (
                <div
                  key={batch.id}
                  className="group bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out relative overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge
                      variant={batch.is_active ? "neutral" : "secondary"}
                      className={cn(
                        "font-bold text-[10px] shadow-lg",
                        batch.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {batch.is_active ? tDetail("live") : tDetail("expired")}
                    </Badge>
                  </div>

                  {/* HTML Preview - Full Display */}
                  <div
                    className="w-full cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => handleGetCoupon(activeMerchant, batch)}
                    dangerouslySetInnerHTML={{ __html: batch.rendered_html }}
                  />

                  {/* Bottom Section - Info & Action */}
                  <div className="p-5 space-y-3 border-t border-slate-100 bg-slate-50/30">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="font-bold text-slate-900 text-base leading-tight line-clamp-2 flex-1">
                        {batch.batch_name}
                      </h4>
                      <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 whitespace-nowrap">
                        {tDetail("left", {
                          count: batch.total_quantity - batch.issued_quantity,
                        })}
                      </span>
                    </div>

                    <Button
                      size="default"
                      className="w-full text-sm font-bold rounded-xl h-11 shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleGetCoupon(activeMerchant, batch)}
                    >
                      {tDetail("getCoupon")}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <TrendingUp className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 font-bold">
                  {tDetail("noActiveCoupons")}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {tDetail("checkBackLater")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
