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
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", // Circuits/Tech
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", // Computer
    "https://images.unsplash.com/photo-1531297422935-40e6e91a002d?auto=format&fit=crop&w=800&q=80", // Electronics
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
    normalizedCat.includes("computer") ||
    normalizedCat.includes("electronics") ||
    normalizedCat.includes("it")
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
  sortBy,
  setSortBy,
  categories,
  cities,
  handleGetCoupon,
}) {
  return (
    <div className="sticky top-20 z-40 mb-8">
      <div className="bg-white/80 backdrop-blur-xl p-3 md:p-4 rounded-2xl md:rounded-full shadow-xl shadow-slate-200/50 border border-white/50 ring-1 ring-slate-100 flex flex-col md:flex-row gap-3 items-center max-w-4xl mx-auto transition-all">
        {/* Search */}
        <div className="flex-1 relative w-full group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-100 p-1.5 rounded-full text-slate-400 group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
            <Search className="h-4 w-4" />
          </div>

          <Input
            placeholder="Search merchants, categories..."
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
              <SelectValue placeholder="Industry" />
            </SelectTrigger>

            <SelectContent className="rounded-xl shadow-md border-slate-200">
              <SelectItem value="all">All Industries</SelectItem>
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
                <SelectValue placeholder="City" />
              </div>
            </SelectTrigger>

            <SelectContent className="rounded-xl shadow-md border-slate-200">
              <SelectItem value="all">Everywhere</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              className="
            w-full md:w-44 h-11
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
                <TrendingUp className="w-4 h-4 text-slate-500 shrink-0" />
                <SelectValue placeholder="Sort" />
              </div>
            </SelectTrigger>

            <SelectContent className="rounded-xl shadow-md border-slate-200">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
            </SelectContent>
          </Select>
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
  hasMore,
  handleLoadMore,
  loadingMore,
  ads = [],
}) {
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
            Loading Marketplace
          </h3>
          <p className="text-slate-400 text-sm font-medium max-w-60 mx-auto leading-relaxed">
            We&apos;re curating the best verified merchants and exclusive deals
            for you...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-red-50 rounded-3xl border border-red-100">
        <Shield className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-red-900 font-bold text-lg">
          Unable to load merchants
        </h3>
        <p className="text-sm font-medium text-red-600/80 mb-6">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          Retry Connection
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

  return (
    <div className="space-y-8">
      {/* Scrollable Container for Merchants */}
      <div
        className={cn(
          "overflow-y-auto scroll-smooth h-[900px] pr-2",
          // Custom scrollbar styles
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-slate-100",
          "[&::-webkit-scrollbar-track]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-slate-300",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:hover:bg-slate-400",
          "pb-8",
        )
        }
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-8 gap-y-10">
          {combinedItems.map((item, idx) => {
            if (item.type === "ad") {
              return (
                <div key={`ad-${idx}`} className="h-full">
                  <InlineAd ad={item.data} />
                </div>
              );
            }

            const merchant = item.data;
            console.log("merchantdata", merchant);
            const isSelected = selectedMerchantId === merchant.id;

            return (
              <div
                key={merchant.id}
                onClick={() => setSelectedMerchantId(merchant.id)}
                className={cn(
                  "group relative bg-white rounded-[2.5rem] overflow-hidden cursor-pointer flex flex-col h-full min-h-[380px] transition-all duration-500",
                  "shadow-md shadow-slate-200/60 ",
                  isSelected
                    ? "shadow-xl shadow-slate-300/70"
                    : "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2",
                )}
              >
                {/* Cover Image Area */}
                <div className="h-44 bg-slate-200 relative overflow-hidden">
                  <Image
                    src={getCategoryImage(merchant.category, merchant.id)}
                    alt="cover"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    fill
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
                <div className="p-6 pt-6 flex-1 flex flex-col relative bg-white border-x border-b border-slate-50 rounded-b-[2.5rem]">
                  <div className="space-y-2 mb-6 text-left ">
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
                        Verified Merchant
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">
                        Available Deals
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {merchant.batches?.length || 0} Offers
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
                      Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8 ">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Merchants"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function MerchantDetail({ activeMerchant, handleGetCoupon }) {
  const router = useRouter();

  // Mobile/Tablet View handled via simple conditionally rendered sheet or similar if needed,
  // but for now keeping the "selected means highlighted" flow.
  // Actually, let's make it a nice Sticky Side Panel for desktop or a Dialog for mobile.
  // Since the parent layout uses a side-by-side flex on large screens, we'll keep the relative structure
  // but make it much nicer.

  if (!activeMerchant) {
    return (
      <div className="hidden lg:flex sticky top-28 h-[600px] w-full flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white shadow-2xl shadow-slate-200/50 overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-slate-50/50 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <h3 className="font-bold text-slate-900 text-2xl mb-4 tracking-tight">
            Ready to Explore?
          </h3>
          <p className="text-slate-400 max-w-60 text-sm font-medium leading-relaxed">
            Click on a merchant profile on the left to unlock their{" "}
            <span className="text-primary font-semibold">
              exclusive coupons
            </span>{" "}
            and limited-time offers.
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

  return (
    <div className="bg-white rounded-4xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden sticky top-28 animate-in slide-in-from-right-10 duration-500 ease-out max-h-[calc(100vh-140px)] flex flex-col">
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
              Available Coupons
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {activeMerchant.batches?.length || 0} Deals Found
            </span>
          </div>
        </div>

        {/* Scrollable Coupons Section */}
        <div className="px-6 md:px-8 pb-6 md:pb-8 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-slate-400">
          <div className="space-y-4">
            {activeMerchant.batches?.length > 0 ? (
              activeMerchant.batches.map((batch) => (
                <div
                  key={batch.id}
                  className="group bg-white rounded-2xl shadow-sm shadow-slate-200/70 hover:shadow-lg hover:scale-[0.99] hover:shadow-slate-300/40 hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-2 right-2 z-10">
                    <Badge
                      variant={batch.is_active ? "neutral" : "secondary"}
                      className={cn(
                        "font-bold text-[10px] shadow-sm",
                        batch.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {batch.is_active ? "LIVE" : "EXPIRED"}
                    </Badge>
                  </div>

                  {/* HTML Preview Thumbnail - Full Width Top */}
                  <div
                    className="w-full cursor-pointer hover:opacity-90 transition overflow-hidden bg-slate-50/50"
                    onClick={() => handleGetCoupon(activeMerchant, batch)}
                    dangerouslySetInnerHTML={{ __html: batch.rendered_html }}
                  />

                  {/* Content - Bottom */}
                  <div className="p-3 space-y-2 border-t border-slate-50">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
                        {batch.batch_name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {batch.total_quantity - batch.issued_quantity} left
                      </span>
                    </div>

                    <div className="pt-1">
                      <Button
                        size="sm"
                        className="w-full text-xs font-bold rounded-lg h-8 shadow-sm"
                        onClick={() => handleGetCoupon(activeMerchant, batch)}
                      >
                        Get Coupon
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 font-medium">
                  No active coupons at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
