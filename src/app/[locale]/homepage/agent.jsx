"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import axiosInstance from "@/lib/axios";
import {
  Loader2,
  Store,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Menu,
  QrCode,
  ArrowRight,
  Smartphone,
  TrendingUp,
  Globe,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TopBannerAd,
  SidebarAd,
  BottomBannerAd,
} from "./components/PaidAdsDisplay";
import {
  MarketplaceFilters,
  MerchantList,
  MerchantDetail,
} from "./components/MerchantMarketplace";
import { cn } from "@/lib/utils";

export default function AgentLandingPage() {
  const tHeroSection = useTranslations("Homepage.heroSection");
  const tFeatures = useTranslations("Homepage.fetaures");
  const tFooter = useTranslations("Homepage.footer");

  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const agentId = searchParams.get("agentId");

  // State
  const [agent, setAgent] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalMerchants, setTotalMerchants] = useState(0);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  // Derived lists
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  // Paid Ads
  const [paidAds, setPaidAds] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Fetch Paid Ads
  const fetchPaidAds = useCallback(async () => {
    if (!agentId) return;
    try {
      const response = await axiosInstance.get(
        `/approvals/approved-paid-ads/admin/${agentId}`,
      );
      const rawData =
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      const transformedAds = rawData
        .filter((item) => item && item.id)
        .map((item) => ({
          id: item.id,
          image: item.paid_ad_image,
          placement:
            item.paid_ad_placement || item.settings?.paid_ad_placement || "top",
          title: item.business_name || "Sponsored Deal",
          description: `Visit ${item.business_name} in ${item.city}, ${item.country}.`,
          redirectUrl: `/${locale}/customer/review?mid=${item.id}`,
          cta: "VIEW OFFER",
          tagline: item.city
            ? `EXCLUSIVE IN ${item.city.toUpperCase()}`
            : "LIMITED TIME",
          city: item.city,
          businessType: item.business_type,
        }));
      setPaidAds(transformedAds);
    } catch (err) {
      console.warn("Failed to load paid ads", err);
    }
  }, [agentId, locale]);

  // Fetch Merchants with Pagination
  const fetchMerchants = useCallback(
    async (pageNum = 1, reset = false) => {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await axiosInstance.get(`/coupons/public-feed`, {
          params: {
            adminId: agentId,
            page: pageNum,
            limit: 20, // Fetch 20 merchants per page
            search: searchQuery,
            category: selectedCategory === "all" ? undefined : selectedCategory,
            city: selectedRegion === "all" ? undefined : selectedRegion,
          },
        });

        const rawData =
          response.data?.data?.merchants ||
          (Array.isArray(response.data) ? response.data : []);

        const normalizedMerchants = rawData
          .filter((item) => item && item.id)
          .map((item) => ({
            id: item.id,
            name: item.business_name || "Unknown",
            category: item.business_type || "General",
            city: item.city || "Unknown",
            country: item.country || "",
            address: item.address || "",
            logo: null,
            coverImage: null,
            batches:
              item.batches?.map((b) => ({
                id: b.id,
                batch_name: b.batch_name,
                discount_percentage: b.discount_percentage,
                expiry_date: b.expiry_date,
                is_active: b.is_active,
                rendered_html: b.rendered_html,
                total_quantity: b.total_quantity,
                issued_quantity: b.issued_quantity,
              })) || [],
          }));

        if (reset) {
          setMerchants(normalizedMerchants);
          // Extract filter options from first page
          const cats = [
            ...new Set(
              normalizedMerchants.map((m) => m.category).filter(Boolean),
            ),
          ].sort();
          const locs = [
            ...new Set(normalizedMerchants.map((m) => m.city).filter(Boolean)),
          ].sort();
          setCategories(cats);
          setCities(locs);
        } else {
          setMerchants((prev) => [...prev, ...normalizedMerchants]);
        }

        // Update pagination state
        setHasMore(normalizedMerchants.length === 20);
        setTotalMerchants(
          response.data?.pagination?.total || normalizedMerchants.length,
        );
        setPage(pageNum);
      } catch (err) {
        console.error("Failed to fetch merchants:", err);
        setError("Unable to load merchants. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [agentId, searchQuery, selectedCategory, selectedRegion],
  );

  // Fetch Main Data
  useEffect(() => {
    const fetchData = async () => {
      if (!agentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Fetch Agent (Mock if waiting for endpoint)
        setAgent({ name: "Partner Network" }); // Default
        /* 
        try {
           const res = await axiosInstance.get(`/agents/${agentId}`);
           if(res.data) setAgent(res.data);
        } catch(e) {}
        */

        // 2. Fetch Merchants with Pagination
        await fetchMerchants(1, true); // Initial load

        // 3. Fetch Ads
        await fetchPaidAds();
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Unable to load page. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    agentId,
    searchQuery,
    selectedCategory,
    selectedRegion,
    fetchPaidAds,
    fetchMerchants,
  ]);

  // Filtering Logic (now primarily handled by backend, but keeping for client-side refinement if needed)
  const filteredMerchants = useMemo(() => {
    return merchants.filter((merchant) => {
      const matchSearch =
        merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === "all" || merchant.category === selectedCategory;
      const matchRegion =
        selectedRegion === "all" || merchant.city === selectedRegion;

      return matchSearch && matchCategory && matchRegion;
    });
  }, [merchants, searchQuery, selectedCategory, selectedRegion]);

  const activeMerchant = useMemo(
    () => merchants.find((m) => m.id === selectedMerchantId) || null,
    [merchants, selectedMerchantId],
  );

  // Derived Ads
  const topAd = paidAds.find((a) => a.placement === "top") || null;
  const leftAd = paidAds.find((a) => a.placement === "left") || null;
  const rightAd =
    paidAds.find((a) => a.placement === "sidebar" || a.placement === "right") ||
    null;
  const bottomAd = paidAds.find((a) => a.placement === "bottom") || null;
  const inlineAds = paidAds.filter((a) => a.placement === "inline");

  // Handlers
  const handleGetCoupon = (merchant, batch) => {
    const message = `Hi ${merchant.name}, I would like to claim the deal: ${batch.batch_name}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchMerchants(page + 1, false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* --- Navigation --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 transition-all">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              QR Rev
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-bold text-slate-500">
              <Link
                href="#marketplace"
                className="hover:text-primary transition-colors"
              >
                Marketplace
              </Link>
              <Link
                href="#features"
                className="hover:text-primary transition-colors"
              >
                Features
              </Link>
              {agent?.name && <span className="text-slate-300">|</span>}
              {agent?.name && (
                <span className="text-slate-900">Partner: {agent.name}</span>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              size="sm"
              className="hidden sm:flex rounded-full font-bold shadow-md shadow-primary/20"
              onClick={() => router.push(`/${locale}/login`)}
            >
              Login
            </Button>
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="text-lg font-bold">
                    Home
                  </Link>
                  <Link href="#marketplace" className="text-lg font-bold">
                    Marketplace
                  </Link>
                  <Button className="w-full">Login</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="relative z-10 -mt-4 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* --- Top Ad Banner --- */}
        <section className="pt-10 px-6 lg:px-10 max-w-[1600px] mx-auto">
          {topAd && <TopBannerAd ad={topAd} />}
        </section>

        {/* --- Highlight / Hero Section --- */}
        <section className="relative w-full overflow-hidden mb-12">
          {/* Background & Content (Same as before) */}
          {/* ... (Keep existing hero content) ... */}
          <div className="absolute inset-0 bg-slate-900">
            <image
              src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1600&q=80"
              className="w-full h-full object-cover opacity-20 mix-blend-overlay"
              alt="hero bg"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 via-slate-900/80 to-slate-50" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 animate-in fade-in zoom-in duration-700 pt-16 pb-20">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 text-white backdrop-blur-sm px-4 py-1.5 uppercase tracking-widest text-xs font-bold shadow-xl"
            >
              Official Partner Network
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-2xl">
              <span className="text-white">Exclusive Deals</span>
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-amber-400 to-amber-600">
                Curated For You
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              Browse verified merchants, unlock instant coupons, and save on
              premium services in your area.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex items-center gap-3">
                <Store className="text-amber-400 w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs text-slate-900 uppercase font-bold tracking-wider">
                    Merchants
                  </div>
                  <div className="font-black text-lg">
                    {merchants.length > 0
                      ? `${merchants.length}+`
                      : "Loading..."}
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex items-center gap-3">
                <Shield className="text-emerald-400 w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs text-slate-900 uppercase font-bold tracking-wider">
                    Verified
                  </div>
                  <div className="font-black text-lg">100%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Filter Bar --- */}
        <section
          className="px-6 lg:px-10 max-w-[1600px] mx-auto mb-8 relative z-20"
          id="marketplace"
        >
          <MarketplaceFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            categories={categories}
            cities={cities}
          />
        </section>

        {/* --- Marketplace Content (3 Columns) --- */}
        <section className="px-6 lg:px-10 max-w-[1700px] mx-auto pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar (Ads Only) */}
            {leftAd && (
              <div className="hidden xl:block lg:col-span-2 sticky top-28 space-y-8 pt-16">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 opacity-50 px-2">
                    <span className="h-px flex-1 bg-slate-300"></span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      Partner
                    </span>
                    <span className="h-px flex-1 bg-slate-300"></span>
                  </div>
                  <SidebarAd ad={leftAd} />
                </div>
              </div>
            )}

            {/* Middle Column: Merchant Grid (Main Content) */}
            <div
              className={cn(
                "col-span-1 lg:col-span-8 w-full min-w-0",
                leftAd ? "xl:col-span-7" : "xl:col-span-9",
              )}
            >
              <MerchantList
                merchants={filteredMerchants}
                selectedMerchantId={selectedMerchantId}
                setSelectedMerchantId={setSelectedMerchantId}
                loading={loading}
                error={error}
                hasMore={hasMore}
                handleLoadMore={handleLoadMore}
                loadingMore={loadingMore}
                ads={inlineAds}
              />
            </div>

            {/* Right Column: Merchant Detail + Right Sidebar Ad */}
            <div className="col-span-1 lg:col-span-4 xl:col-span-3 lg:block min-w-0">
              <div className="sticky top-24 space-y-8">
                {/* Detail Panel */}
                <MerchantDetail
                  activeMerchant={activeMerchant}
                  handleGetCoupon={handleGetCoupon}
                />

                {/* Right Sidebar Ad */}
                {rightAd && (
                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-4 opacity-50 px-2">
                      <span className="h-px flex-1 bg-slate-300"></span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        Sponsored
                      </span>
                      <span className="h-px flex-1 bg-slate-300"></span>
                    </div>
                    <SidebarAd ad={rightAd} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Detail Modal */}
          {selectedMerchantId && (
            <Sheet
              open={!!selectedMerchantId && window.innerWidth < 1024}
              onOpenChange={(open) => !open && setSelectedMerchantId(null)}
            >
              <SheetContent
                side="bottom"
                className="h-[85vh] p-0 rounded-t-3xl border-0"
              >
                <div className="overflow-y-auto h-full">
                  <MerchantDetail
                    activeMerchant={activeMerchant}
                    handleGetCoupon={handleGetCoupon}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </section>

        {/* -- Features Section -- */}
        <section
          className="bg-white py-24 border-t border-slate-100"
          id="features"
        >
          <div className="px-6 lg:px-10 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge
                variant="outline"
                className="mb-4 text-slate-400 border-slate-200"
              >
                Why Choose Us
              </Badge>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl mb-4 text-slate-900">
                {tFeatures("h1")}
              </h2>
              <p className="text-slate-500 text-lg">
                {tFeatures("description")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Smartphone,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  h: tFeatures("card1Heading"),
                  d: tFeatures("card1Description"),
                },
                {
                  icon: TrendingUp,
                  color: "text-orange-600",
                  bg: "bg-orange-50",
                  h: tFeatures("card2Heading"),
                  d: tFeatures("card2Description"),
                },
                {
                  icon: Globe,
                  color: "text-green-600",
                  bg: "bg-green-50",
                  h: tFeatures("card3Heading"),
                  d: tFeatures("card3Description"),
                },
              ].map((fet, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`h-14 w-14 rounded-2xl ${fet.bg} ${fet.color} flex items-center justify-center mb-6`}
                  >
                    <fet.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">
                    {fet.h}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {fet.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Bottom Ad Banner --- */}
        <section className="pt-10 pb-0">
          {bottomAd && <BottomBannerAd ad={bottomAd} />}
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 lg:px-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg tracking-tight">
                QR Rev
              </span>
              <span className="text-xs text-slate-500">
                Global Merchant Network
              </span>
            </div>
          </div>

          <div className="flex gap-8 text-sm font-bold">
            <Link href="#" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition">
              Agent Login
            </Link>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} QR Rev. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
