"use client";
import {
  Search,
  MapPin,
  Store,
  Shield,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { InlineAd } from "./PaidAdsDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function MarketplaceFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedRegion,
  setSelectedRegion,
  categories,
  cities,
}) {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col lg:flex-row gap-3 items-center ring-12 ring-slate-100/30 max-w-5xl mx-auto relative z-10 transition-all hover:ring-slate-100/50">
      <div className="flex-1 relative border border-slate-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 rounded-2xl w-full transition-all text-left">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="What are you looking for?"
          className="pl-12 h-14 border-0 bg-transparent focus-visible:ring-0 text-lg font-medium placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-2 w-full lg:w-auto flex-col sm:flex-row">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px] h-14 bg-slate-50 border-0 focus:ring-4 focus:ring-primary/5 rounded-2xl text-slate-700 font-bold">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
            <SelectItem value="all" className="rounded-lg">
              All Categories
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="rounded-lg">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-full sm:w-[180px] h-14 bg-slate-50 border-0 focus:ring-4 focus:ring-primary/5 rounded-2xl text-slate-700 font-bold">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <SelectValue placeholder="Location" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
            <SelectItem value="all" className="rounded-lg">
              Everywhere
            </SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city} className="rounded-lg">
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      <div className="lg:w-1/3 flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-32 w-full bg-slate-200/50 rounded-3xl border border-slate-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:w-1/3 flex flex-col items-center justify-center py-20 text-center px-4">
        <Shield className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-sm font-medium text-slate-600">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="lg:w-1/3 flex flex-col gap-3 overflow-y-auto h-[700px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      {merchants.map((merchant, index) => {
        const isSelected = selectedMerchantId === merchant.id;
        // Show inline ad after every 5 merchants if ads available
        const showAd = index > 0 && index % 5 === 0 && ads.length > 0;
        const adToDisplay = ads[Math.floor(index / 5) % ads.length];

        return (
          <div key={merchant.id} className="contents">
            {showAd && <InlineAd ad={adToDisplay} />}
            <div
              onClick={() => setSelectedMerchantId(merchant.id)}
              className={cn(
                "group relative cursor-pointer rounded-2xl border p-5 transition-all text-left",
                isSelected
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]"
                  : "bg-white border-slate-100 hover:border-primary/30",
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg truncate flex-1">
                  {merchant.name}
                </h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    isSelected ? "bg-white/10 text-white" : "bg-slate-100",
                  )}
                >
                  {merchant.category}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs flex items-center gap-1",
                    isSelected ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  <MapPin className="w-3 h-3" /> {merchant.city}
                </span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border",
                    isSelected
                      ? "border-white/20 text-white"
                      : "border-slate-200",
                  )}
                >
                  {merchant.batches?.length || 0} Offers
                </span>
              </div>
            </div>
          </div>
        );
      })}
      {hasMore && (
        <Button
          variant="ghost"
          className="w-full text-slate-500 text-xs py-6 border border-dashed"
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Load More"
          )}
        </Button>
      )}
    </div>
  );
}

export function MerchantDetail({ activeMerchant, handleGetCoupon }) {
  if (!activeMerchant) {
    return (
      <div className="lg:w-2/3 bg-white rounded-3xl border border-slate-200 shadow-2xl h-[700px] overflow-hidden flex flex-col">
        <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-4 bg-slate-50/50">
          <Store className="h-16 w-16 opacity-10" />
          <h3 className="text-xl font-bold text-slate-900">
            Select a Merchant
          </h3>
          <p className="max-w-xs text-sm">
            Pick a business from the list to view their exclusive digital
            coupons.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-2/3 bg-white rounded-3xl border border-slate-200 shadow-2xl h-[700px] overflow-hidden flex flex-col">
      <div className="relative h-40 shrink-0 bg-slate-900 text-left">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-black" />
        <div className="absolute bottom-6 left-8 right-8 flex items-end gap-5">
          <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Store className="h-10 w-10 text-primary" />
          </div>
          <div className="pb-1 text-white">
            <h2 className="text-2xl font-black">{activeMerchant.name}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {activeMerchant.address}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Available Promotions
          </span>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-none">
            {activeMerchant.batches?.length || 0} Deals
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {activeMerchant.batches?.map((batch) => (
            <div
              key={batch.id}
              className="group bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-all space-y-4"
            >
              <div
                className="aspect-video rounded-xl overflow-hidden cursor-pointer bg-slate-50 flex items-center justify-center border border-slate-50"
                onClick={() => handleGetCoupon(activeMerchant, batch)}
                dangerouslySetInnerHTML={{ __html: batch.rendered_html }}
              />
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-left leading-tight">
                    {batch.batch_name}
                  </h4>
                  <Badge
                    className={cn(
                      "text-[8px] px-1.5 h-4",
                      batch.is_active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {batch.is_active ? "LIVE" : "ENDED"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>
                    Quantity: {batch.total_quantity - batch.issued_quantity}{" "}
                    rem.
                  </span>
                  <span>
                    Ends {new Date(batch.end_date).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  className="w-full h-10 rounded-xl bg-slate-900 text-white font-bold"
                  onClick={() => handleGetCoupon(activeMerchant, batch)}
                >
                  Get Voucher
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
