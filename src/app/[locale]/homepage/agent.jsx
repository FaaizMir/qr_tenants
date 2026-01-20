"use client";

import Link from "next/link";
import {
  ArrowRight,
  QrCode,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  Gift,
  CheckCircle2,
  Search,
  MapPin,
  Store,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useEffect, useState, useCallback } from "react";
import useDebounce from "@/hooks/useDebounceRef";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";

export default function AgentLandingPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const tHeroSection = useTranslations("Homepage.heroSection");
  const tFeatures = useTranslations("Homepage.fetaures");
  const tFooter = useTranslations("Homepage.footer");
  const locale = useLocale();
  const router = useRouter();

  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalMerchants, setTotalMerchants] = useState(0);

  const agent_id = useSearchParams().get("agentId");

  const fetchMerchants = useCallback(
    async (pageToFetch = 1, append = false) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        // Pass pagination and filter params
        const response = await axiosInstance.get("/coupons/public-feed", {
          params: {
            adminId: agent_id,
            page: pageToFetch,
            pageSize: 20,
            search: debouncedSearch,
            businessType:
              selectedCategory === "all" ? undefined : selectedCategory,
            city: selectedRegion === "all" ? undefined : selectedRegion,
          },
        });

        const responseData = response.data?.data;
        const merchantsData = responseData?.merchants || [];
        const total = responseData?.total || 0;

        if (!Array.isArray(merchantsData)) {
          setMerchants([]);
          return;
        }

        // Transform merchants
        const transformedMerchants = merchantsData.map((merchant) => ({
          id: merchant.id,
          name: merchant.business_name,
          category: merchant.business_type,
          address: merchant.address,
          city:
            merchant.city ||
            merchant.address?.split(",")?.pop()?.trim() ||
            "Unknown",
          batches: merchant.batches,
          user: merchant.user,
        }));

        if (append) {
          setMerchants((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newUnique = transformedMerchants.filter(
              (m) => !existingIds.has(m.id),
            );
            const combined = [...prev, ...newUnique];
            setHasMore(combined.length < total);
            return combined;
          });
        } else {
          setMerchants(transformedMerchants);
          setHasMore(transformedMerchants.length < total);
        }

        setTotalMerchants(total);

        // Always capture unique cities/categories from the API to keep filters updated
        setCities((prev) => {
          const newCities = transformedMerchants
            .map((m) => m.city)
            .filter(Boolean);
          return [...new Set([...prev, ...newCities])].sort();
        });

        setCategories((prev) => {
          const newCats = transformedMerchants
            .map((m) => m.category)
            .filter(Boolean);
          return [...new Set([...prev, ...newCats])].sort();
        });
      } catch (err) {
        console.error("Failed to fetch merchants:", err);
        setError("Failed to load merchants.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [agent_id, debouncedSearch, selectedCategory, selectedRegion],
  );

  // Initial fetch and fetch on filter change
  useEffect(() => {
    if (agent_id) {
      setPage(1);
      fetchMerchants(1, false);
    }
  }, [agent_id, debouncedSearch, selectedCategory, selectedRegion]);
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMerchants(nextPage, true);
  };

  // -- Filtering Logic --
  // We apply client-side filtering on the loaded 'merchants' as a fallback/enhancement
  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || m.category === selectedCategory;
    const matchesRegion = selectedRegion === "all" || m.city === selectedRegion;

    return matchesSearch && matchesCategory && matchesRegion;
  });

  // Display filtered results
  const displayedMerchants = filteredMerchants;

  // Clear selection when filters change
  useEffect(() => {
    setSelectedMerchantId(null);
  }, [searchQuery, selectedCategory, selectedRegion]);

  const activeMerchant = selectedMerchantId
    ? merchants.find((m) => m.id === selectedMerchantId)
    : null;

  // -- Handlers --
  const handleGetCoupon = (merchant, batch) => {
    const merchantId = merchant.id;
    // const batchId = batch.id;
    router.push(`/${locale}/customer/review?mid=${merchantId}`);
    sessionStorage.setItem(
      "couponReviewData",
      JSON.stringify({ merchant, batch }),
    );
  };

  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900">
      {/* -- Navigation -- */}
      <header className="px-6 lg:px-10 py-5 flex items-center justify-between border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <QrCode className="h-5 w-5" />
          </div>
          QR Rev
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/login`}
            className="text-sm font-medium hover:text-primary"
          >
            Sign In
          </Link>
          <Link href={`/${locale}/login`}>
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* -- Hero Section -- */}
        <section className="px-6 lg:px-10 py-20 lg:py-28 flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">
          <Badge
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 text-sm"
          >
            Local Marketplace
          </Badge>
          <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Exclusive Deals <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600 animate-gradient">
              In Your Area
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access premium offers from top-rated merchants. Save more with
            digital coupons and instant rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="#marketplace">
              <Button
                size="lg"
                className="h-14 px-8 text-lg shadow-lg shadow-primary/20 rounded-xl"
              >
                Explore Offers <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* -- Sponsored Ad Slot -- */}
        <section className="px-6 lg:px-10 pb-16 flex justify-center">
          <div className="w-full max-w-7xl mx-auto relative overflow-hidden rounded-2xl bg-slate-900 shadow-2xl border border-slate-800">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-size-[20px_20px]" />
            <div className="flex flex-col md:flex-row items-center justify-between p-8 relative z-10 gap-8">
              <div className="text-center md:text-left space-y-4">
                <Badge className="bg-amber-500 text-slate-900 hover:bg-amber-600 border-0">
                  FEATURED PARTNER
                </Badge>
                <h3 className="text-3xl md:text-4xl font-extrabold text-white">
                  CloudScale Pro
                  <span className="block text-amber-400">
                    50% Off Annual Plans
                  </span>
                </h3>
                <p className="text-slate-300 text-lg max-w-xl">
                  Exclusive offer for QR Rev users. Scale your infrastructure
                  with $500 free credits.
                </p>
              </div>
              <Button
                size="lg"
                className="bg-amber-500 text-slate-900 font-bold hover:bg-amber-600 border-0 px-8 h-12"
              >
                Claim Offer
              </Button>
            </div>
          </div>
        </section>

        {/* -- Public Coupon Marketplace -- */}
        <section
          className="bg-slate-50 py-20 border-y border-slate-200"
          id="marketplace"
        >
          <div className="px-6 lg:px-10 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4 mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/20">
                <TrendingUp className="w-3.5 h-3.5" /> Live Marketplace
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 pt-2">
                Explore Local Deals
              </h2>
              <p className="text-slate-500 text-lg">
                Discover exclusive coupons and instant rewards from premium
                merchants in your neighborhood.
              </p>
            </div>

            {/* -- Search & Filters -- */}
            <div className="bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0)] border border-slate-200 flex flex-col lg:flex-row gap-2 items-center ring-4 ring-slate-100/50">
              <div className="flex-1 relative border focus-within:border-primary rounded-2xl w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search businesses..."
                  className="pl-12 h-12 border-0 bg-transparent focus-visible:ring-0 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full lg:w-auto flex-col sm:flex-row pr-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-[220px] h-14 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl  text-slate-700">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="all">All Industries</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedRegion}
                  onValueChange={setSelectedRegion}
                >
                  <SelectTrigger className="w-full sm:w-[200px] h-14 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl  text-slate-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <SelectValue placeholder="Location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="all">Everywhere</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* -- Master-Detail Layout -- */}
            <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
              {/* Left Side: Merchant List */}
              <div className="lg:w-1/3 flex flex-col gap-3 overflow-y-auto h-[700px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {loading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-32 w-full bg-slate-900/5 rounded-4xl border border-slate-200/50 flex flex-col p-6 gap-3 relative overflow-hidden"
                      >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2s_infinite]" />
                        <div className="flex justify-between items-start">
                          <div className="h-5 w-32 bg-slate-200/60 rounded-lg" />
                          <div className="h-6 w-16 bg-slate-200/60 rounded-full" />
                        </div>
                        <div className="h-4 w-24 bg-slate-200/40 rounded-lg" />
                        <div className="mt-auto h-4 w-40 bg-slate-200/40 rounded-lg" />
                      </div>
                    ))}
                    <style jsx>{`
                      @keyframes shimmer {
                        100% {
                          transform: translateX(100%);
                        }
                      }
                    `}</style>
                    <div className="flex flex-col items-center justify-center py-6 space-y-2 opacity-50">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Syncing Market Data...
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <Shield className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      Retry Connection
                    </Button>
                  </div>
                ) : (
                  <>
                    {filteredMerchants.length > 0 ? (
                      displayedMerchants.map((merchant) => {
                        const isSelected = selectedMerchantId === merchant.id;

                        // Premium Dark Theme logic
                        const getCategoryStyles = (category) => {
                          const cat = category?.toLowerCase() || "";
                          const base = {
                            bg: "bg-slate-800",
                            border: isSelected
                              ? "border-white"
                              : "border-slate-800",
                            text: "text-white",
                            subText: "text-slate-400",
                            badge: "bg-slate-800 text-slate-400",
                            accent: "text-white",
                            icon: "text-slate-500",
                          };

                          if (cat.includes("food") || cat.includes("restau")) {
                            return {
                              ...base,
                              border: isSelected
                                ? "border-orange-500 shadow-orange-500/20"
                                : "border-slate-800",
                              accent: "text-orange-400",
                              badge: isSelected
                                ? "bg-orange-500 text-white"
                                : "bg-orange-500/10 text-orange-400",
                              icon: "text-orange-500/50",
                            };
                          }
                          if (cat.includes("retail")) {
                            return {
                              ...base,
                              border: isSelected
                                ? "border-zinc-400 shadow-zinc-400/20"
                                : "border-slate-800",
                              accent: "text-zinc-300",
                              badge: isSelected
                                ? "bg-zinc-400 text-black"
                                : "bg-zinc-400/10 text-zinc-300",
                              icon: "text-zinc-400/50",
                            };
                          }

                          if (cat.includes("service")) {
                            return {
                              ...base,
                              border: isSelected
                                ? "border-emerald-500 shadow-emerald-500/20"
                                : "border-slate-800",
                              accent: "text-emerald-400",
                              badge: isSelected
                                ? "bg-emerald-500 text-white"
                                : "bg-emerald-500/10 text-emerald-400",
                              icon: "text-emerald-500/50",
                            };
                          }
                          return base;
                        };

                        const styles = getCategoryStyles(merchant.category);

                        return (
                          <div
                            key={merchant.id}
                            onClick={() => setSelectedMerchantId(merchant.id)}
                            className={cn(
                              "group relative cursor-pointer rounded-3xl border p-6 mx-6 mt-3 transition-all",
                              styles.bg,
                              styles.border,
                              isSelected
                                ? "shadow-2xl ring-1 ring-white/10 z-10 scale-[1.02] -translate-y-1"
                                : "hover:border-slate-700 hover:scale-[1.01]",
                            )}
                          >
                            {/* Selection Indicator Dot */}
                            {isSelected && (
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-r-full shadow-[0_0_20px_rgba(255,165,0,0.8)] animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="absolute inset-0 bg-primary rounded-r-full animate-ping opacity-20" />
                              </div>
                            )}

                            {/* Backdrop Glow for Selected */}
                            {isSelected && (
                              <div
                                className={cn(
                                  "absolute -inset-1 rounded-[2.1rem] blur-xl opacity-20 -z-10",
                                  merchant.category
                                    .toLowerCase()
                                    .includes("food") && "bg-blue-950",
                                  merchant.category
                                    .toLowerCase()
                                    .includes("retail") && "bg-blue-950",
                                  merchant.category
                                    .toLowerCase()
                                    .includes("service") && "bg-blue-950",
                                )}
                              />
                            )}

                            {/* Top Row: Name & Category */}
                            <div className="flex items-center justify-between mb-4 gap-3">
                              <h3
                                className={cn(
                                  "font-semibold text-xl leading-tight truncate tracking-tight transition-colors duration-300",
                                  styles.text,
                                  isSelected && styles.accent,
                                )}
                              >
                                {merchant.name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "shrink-0 text-[10px] px-3 py-1 font-black uppercase tracking-widest border-0 transition-colors duration-300",
                                  styles.badge,
                                )}
                              >
                                {merchant.category}
                              </Badge>
                            </div>

                            {/* Middle Row: Location & Offer Count */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs font-bold transition-colors duration-300">
                                <MapPin
                                  className={cn(
                                    "h-4 w-4 mr-2 shrink-0 transition-colors",
                                    isSelected ? styles.accent : styles.icon,
                                  )}
                                />
                                <span
                                  className={cn(
                                    "truncate max-w-[150px]",
                                    styles.subText,
                                  )}
                                >
                                  {merchant.city || "Local Business"}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "text-[11px] font-black px-4 py-1.5 rounded-full border transition-all duration-300",
                                  isSelected
                                    ? "bg-white text-slate-900 border-white shadow-lg"
                                    : "bg-slate-800 text-slate-400 border-slate-700 group-hover:bg-slate-700 group-hover:text-white",
                                )}
                              >
                                {merchant.batches?.length || 0} Offers
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-20 text-center px-10 bg-white/50 rounded-2xl border border-dashed border-slate-300">
                        <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <h4 className="font-bold text-slate-900">
                          No results found
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                          Try adjusting your search or category filters.
                        </p>
                      </div>
                    )}

                    {hasMore && (
                      <div className="pt-4 pb-2 flex justify-center w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="text-slate-500 hover:text-primary hover:bg-primary/5 w-full border border-dashed border-slate-300 rounded-xl h-12"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Loading more...
                            </>
                          ) : (
                            "Load More Merchants"
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right Side: Coupons Detail */}
              <div
                key={selectedMerchantId || "empty"}
                className="lg:w-2/3 bg-white rounded-3xl border border-slate-200 shadow-2xl h-[700px] overflow-hidden relative flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              >
                {activeMerchant ? (
                  <>
                    <div className="relative h-44 shrink-0 overflow-hidden">
                      <div className="absolute inset-0 bg-slate-900">
                        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center" />
                        <div
                          className={cn(
                            "absolute inset-0 bg-linear-to-b from-transparent to-black/80",
                            activeMerchant.category === "Food and Beverage" &&
                              "bg-orange-600/20",
                            activeMerchant.category === "Retails" &&
                              "bg-blue-600/20",
                            activeMerchant.category === "Services" &&
                              "bg-emerald-600/20",
                          )}
                        />
                      </div>

                      <div className="absolute -bottom-1 left-0 w-full h-16 bg-linear-to-t from-white to-transparent" />

                      <div className="absolute bottom-4 left-8 right-8 flex items-end gap-6 z-10">
                        <div className="h-24 w-24 bg-white rounded-2xl shadow-2xl border-4 border-white flex items-center justify-center text-slate-700 shrink-0 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                          <Store className="h-12 w-12 text-primary" />
                        </div>
                        <div className="mb-2 pb-1">
                          <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                              {activeMerchant.name}
                            </h2>
                            <Badge className="bg-primary/90 text-white border-0 text-[10px] font-black uppercase tracking-widest px-3">
                              Verified
                            </Badge>
                          </div>
                          <p className="text-slate-200 text-sm font-medium mt-1 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />{" "}
                            {activeMerchant.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pt-8 pb-12 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                          <Gift className="w-4 h-4 text-primary" /> Active
                          Voucher Collection
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 italic">
                          {activeMerchant.batches?.length || 0} Special Offers
                          Available
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6 pb-4 cursor-pointer">
                        {activeMerchant.batches &&
                        activeMerchant.batches.length > 0 ? (
                          activeMerchant.batches.map((batch) => (
                            <div
                              key={batch.id}
                              className="group relative flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 ">
                                <div className="h-8 w-8 rounded-full bg-white/90 backdrop-blur text-primary shadow-sm flex items-center justify-center ">
                                  <Sparkles className="w-4 h-4" />
                                </div>
                              </div>

                              <div className="p-1.5">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: batch.rendered_html,
                                  }}
                                  onClick={() =>
                                    handleGetCoupon(activeMerchant, batch)
                                  }
                                  className="cursor-pointer overflow-hidden rounded-[1.2rem] transform group-hover:scale-[1.01] transition-transform duration-500 shadow-sm"
                                />
                              </div>

                              <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-extrabold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 capitalize text-base">
                                      {batch.batch_name}
                                    </h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                      Valid until{" "}
                                      {new Date(
                                        batch.end_date,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge
                                    className={cn(
                                      "text-[9px] font-bold uppercase tracking-tighter px-2 h-5 flex items-center shadow-sm",
                                      batch.is_active
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                        : "bg-slate-50 text-slate-500 border border-slate-100",
                                    )}
                                  >
                                    {batch.is_active ? "Live" : "Ended"}
                                  </Badge>
                                </div>

                                <div className="space-y-2">
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                                      style={{
                                        width: `${
                                          (batch.issued_quantity /
                                            batch.total_quantity) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                    <span>{batch.issued_quantity} Issued</span>
                                    <span>
                                      {batch.total_quantity -
                                        batch.issued_quantity}{" "}
                                      Remaining
                                    </span>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleGetCoupon(activeMerchant, batch)
                                  }
                                  className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                                >
                                  Get Coupon
                                  <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-24 text-center text-muted-foreground border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                            <Gift className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-lg font-bold text-slate-400">
                              No active offers currently
                            </p>
                            <p className="text-sm mt-1">
                              Check back later for new deals from this merchant.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
                    <div className="relative mb-8">
                      <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                      <div className="relative h-24 w-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary/30 rotate-12 transition-transform hover:rotate-0 duration-500 border border-slate-100">
                        <Store className="h-12 w-12" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                      Ready to Shop?
                    </h3>
                    <p className="text-slate-500 max-w-sm mt-2 font-medium">
                      Select a merchant from the list to discover exclusive
                      local rewards and hidden gems.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      Secured <Shield className="w-3 h-3" /> Encrypted
                      Marketplace
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* -- Inline Ad (Category Placement) -- */}
            <div className="rounded-xl border border-dashed border-slate-300 p-8 flex flex-col md:flex-row items-center gap-8 justify-between bg-slate-50/50 mt-12">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Sponsored Ads
                </span>
                <h4 className="text-lg font-bold">
                  Want to see your business here?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Boost your visibility with our new Paid Ad Placements.
                </p>
              </div>
              <Link href={`/${locale}/login`}>
                <Button variant="outline">Advertise with us</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* -- Features -- */}
        <section className="bg-white py-20 lg:py-32">
          <div className="px-6 lg:px-10 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                {tFeatures("h1")}
              </h2>
              <p className="text-muted-foreground text-lg">
                {tFeatures("description")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Smartphone,
                  color: "text-blue-600",
                  bg: "bg-blue-100",
                  h: tFeatures("card1Heading"),
                  d: tFeatures("card1Description"),
                },
                {
                  icon: TrendingUp,
                  color: "text-orange-600",
                  bg: "bg-orange-100",
                  h: tFeatures("card2Heading"),
                  d: tFeatures("card2Description"),
                },
                {
                  icon: Globe,
                  color: "text-green-600",
                  bg: "bg-green-100",
                  h: tFeatures("card3Heading"),
                  d: tFeatures("card3Description"),
                },
              ].map((fet, i) => (
                <div
                  key={i}
                  className="bg-slate-50 p-8 rounded-2xl border hover:shadow-lg transition-all duration-300"
                >
                  <div
                    className={`h-12 w-12 rounded-xl headers ${fet.bg} ${fet.color} flex items-center justify-center mb-6`}
                  >
                    <fet.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{fet.h}</h3>
                  <p className="text-muted-foreground">{fet.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* -- Footer -- */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center">
              <QrCode className="h-4 w-4" />
            </div>
            QR Rev
          </div>
          <div className="text-sm">{tFooter("text")}</div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="#" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      {/* -- Get Coupon Dialog -- */}
      {/* <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          {!redemptionSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Get Batch</DialogTitle>
                <DialogDescription>
                  Receive your <b>{selectedCoupon?.batch_name || selectedCoupon?.title}</b> batch from{" "}
                  {selectedCoupon?.merchantName} via WhatsApp.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRedeemSubmit} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    required
                    placeholder="e.g. Jane Doe"
                    value={customerForm.name}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number (WhatsApp)</Label>
                  <Input
                    required
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Birthday</Label>
                  <Input
                    required
                    type="date"
                    value={customerForm.dob}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, dob: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3 mt-0.5" />
                    <p>
                      We&apos;ll use this to send your unique QR code. No spam.
                    </p>
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isRedeeming}
                  >
                    {isRedeeming ? "Processing..." : "Send to WhatsApp"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-4 animate-in zoom-in duration-300">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-2xl text-green-700">
                  Sent Successfully!
                </DialogTitle>
                <DialogDescription>
                  Your batch for <b>{selectedCoupon?.batch_name || selectedCoupon?.title}</b> has been sent
                  to <b>{customerForm.phone}</b>.
                </DialogDescription>
              </div>
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
