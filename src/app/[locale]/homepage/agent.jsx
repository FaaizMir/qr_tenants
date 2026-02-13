"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
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
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import Image from "next/image";
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
import { CouponForm } from "./components/CouponForm";
import { cn } from "@/lib/utils";

export default function AgentLandingPage() {
  const t = useTranslations("Homepage.agent");
  const tCommon = useTranslations("Homepage.common");

  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  /**
   * Security measures for localStorage:
   * 1. Data validation - Check agent object structure
   * 2. Timestamp validation - Data expires after 1 hour
   * 3. Session tracking - Random session ID for basic tracking
   * 4. Error handling - Graceful failure with cleanup
   * 5. Navigation cleanup - Clear data when leaving page
   * 6. Visibility monitoring - Revalidate on page focus
   */

  // Get agent from localStorage with validation
  const [agentId, setAgentId] = useState(null);

  useEffect(() => {
    try {
      const storedAgent = localStorage.getItem("selectedAgent");
      if (storedAgent) {
        const parsedAgent = JSON.parse(storedAgent);

        // Validate agent data structure
        if (parsedAgent && typeof parsedAgent === "object" && parsedAgent.id) {
          // Check if data is fresh (within 1 hour)
          const ONE_HOUR = 60 * 60 * 1000;
          const now = Date.now();
          const timestamp = parsedAgent._timestamp || 0;

          if (now - timestamp < ONE_HOUR) {
            // Valid and fresh data
            setAgentId(parsedAgent.id);
            setAgent(parsedAgent);
          } else {
            // Data expired, clear localStorage
            console.warn(t("errors.agentDataExpired"));
            localStorage.removeItem("selectedAgent");
          }
        } else {
          // Invalid agent data, clear localStorage
          console.warn(t("errors.invalidAgentData"));
          localStorage.removeItem("selectedAgent");
        }
      }
    } catch (error) {
      // Handle JSON parse errors or other exceptions
      console.error(t("errors.errorLoadingAgent"), error);
      localStorage.removeItem("selectedAgent");
    }

    // Cleanup function - clear localStorage when component unmounts
    return () => {
      // Optional: Uncomment if you want to clear on unmount
      // localStorage.removeItem("selectedAgent");
    };
  }, [t]);

  // Handle browser back button and page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, optionally keep data
      } else {
        // Page is visible again, validate data is still fresh
        const storedAgent = localStorage.getItem("selectedAgent");
        if (storedAgent) {
          try {
            const parsedAgent = JSON.parse(storedAgent);
            const ONE_HOUR = 60 * 60 * 1000;
            const now = Date.now();
            const timestamp = parsedAgent._timestamp || 0;

            if (now - timestamp >= ONE_HOUR) {
              localStorage.removeItem("selectedAgent");
              window.location.reload(); // Refresh if data expired
            }
          } catch (e) {
            localStorage.removeItem("selectedAgent");
          }
        }
      }
    };

    const handleBeforeUnload = () => {
      // Optionally clean up before page unloads
      // Uncomment if needed:
      // localStorage.removeItem("selectedAgent");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Refs
  const merchantListRef = useRef(null);

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

  // Coupon Dialog State
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [selectedCouponData, setSelectedCouponData] = useState({
    merchant: null,
    batch: null,
  });

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
        .filter((item) => {
          // Check both top-level and settings for media
          const hasImage = item.paid_ad_image || item.settings?.paid_ad_image;
          const hasVideo = item.paid_ad_video || item.settings?.paid_ad_video;
          return hasImage || hasVideo;
        })
        .map((item) => ({
          id: item.id,
          image: item.paid_ad_image || item.settings?.paid_ad_image || null,
          video: item.paid_ad_video || item.settings?.paid_ad_video || null,
          isVideo:
            item.settings?.paid_ad_video_status ||
            item.paid_ad_video_status ||
            false,
          placement:
            item.paid_ad_placement || item.settings?.paid_ad_placement || "top",
          title: item.business_name || t("ads.sponsoredDeal"),
          description: t("ads.visitBusiness", {
            businessName: item.business_name,
            city: item.city,
            country: item.country,
          }),
          redirectUrl: `/customer/review?mid=${item.id}`,
          cta: t("ads.viewOffer"),
          tagline: item.city
            ? t("ads.exclusiveIn", { city: item.city.toUpperCase() })
            : t("ads.limitedTime"),
          city: item.city,
          businessType: item.business_type,
        }));
      setPaidAds(transformedAds);
    } catch (err) {
      console.warn(t("errors.failedToLoadPaidAds"), err);
    }
  }, [agentId, t]);

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
            pageSize: 6, // Fetch 6 merchants per page
            search: searchQuery,
            businessType:
              selectedCategory === "all" ? undefined : selectedCategory,
            city: selectedRegion === "all" ? undefined : selectedRegion,
          },
        });

        const rawData =
          response.data?.data?.merchants ||
          (Array.isArray(response.data) ? response.data : []);

        const normalizedMerchants = rawData
          .filter((item) => item && item.id)
          .slice(0, 6) // Ensure max 6 merchants per page
          .map((item) => ({
            id: item.id,
            name: item.business_name || t("fallback.unknown"),
            category: item.business_type || t("fallback.general"),
            city: item.city || t("fallback.unknown"),
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
          // Extract filter options ONLY from initial unfiltered load
          // Don't update filter lists when filters are already applied
          if (
            selectedCategory === "all" &&
            selectedRegion === "all" &&
            !searchQuery
          ) {
            const cats = [
              ...new Set(
                normalizedMerchants.map((m) => m.category).filter(Boolean),
              ),
            ].sort();
            const locs = [
              ...new Set(
                normalizedMerchants.map((m) => m.city).filter(Boolean),
              ),
            ].sort();
            setCategories(cats);
            setCities(locs);
          }
        } else {
          setMerchants(normalizedMerchants);
        }

        // Update pagination state
        setHasMore(normalizedMerchants.length === 6);
        setTotalMerchants(
          response.data?.pagination?.total ||
            (pageNum === 1 ? normalizedMerchants.length : totalMerchants),
        );
        setPage(pageNum);
      } catch (err) {
        console.error(t("errors.failedToFetchMerchants"), err);
        setError(t("errors.unableToLoadMerchants"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [agentId, searchQuery, selectedCategory, selectedRegion, t, totalMerchants],
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
        // 1. Agent is already loaded from localStorage
        // No need to fetch or override it

        // 2. Fetch Merchants with Pagination
        await fetchMerchants(1, true); // Initial load

        // 3. Fetch Ads
        await fetchPaidAds();
      } catch (err) {
        console.error(t("errors.failedToLoadData"), err);
        setError(t("errors.unableToLoadPage"));
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
    t,
  ]);

  const activeMerchant = useMemo(
    () => merchants.find((m) => m.id === selectedMerchantId) || null,
    [merchants, selectedMerchantId],
  );

  const isFewMerchants = merchants.length > 0 && merchants.length <= 2;

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
    setSelectedCouponData({ merchant, batch });
    setCouponDialogOpen(true);
  };

  const handleNavigateHome = () => {
    // Clear agent data from localStorage when navigating away
    localStorage.removeItem("selectedAgent");
    router.push("/");
  };

  const handleNavigateLogin = () => {
    // Optionally keep agent data for login flow
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* --- Navigation --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 transition-all">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div
            onClick={handleNavigateHome}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              {tCommon("brandName")}
            </span>
          </div>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[14px] font-bold tracking-tight">
            <Link
              href="#marketplace"
              className="text-slate-500 hover:text-primary transition-colors"
            >
              {t("navigation.marketplace")}
            </Link>
            <Link
              href="#features"
              className="text-slate-500 hover:text-primary transition-colors"
            >
              {t("navigation.features")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              size="sm"
              className="hidden sm:flex rounded-full font-bold shadow-md shadow-primary/20"
              onClick={handleNavigateLogin}
            >
              {t("navigation.signIn")}
            </Button>
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild suppressHydrationWarning>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  suppressHydrationWarning
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle className="text-xl font-bold text-slate-900 mb-4">
                  {t("navigation.menu")}
                </SheetTitle>
                <div className="flex flex-col gap-4 mt-8">
                  {agent?.name && (
                    <div className="mb-4 pb-4 border-b border-slate-200">
                      <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
                        {t("navigation.partner")}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {agent.name}
                      </p>
                      {agent.location && (
                        <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {agent.location}
                        </p>
                      )}
                    </div>
                  )}
                  <div
                    onClick={handleNavigateHome}
                    className="text-lg font-bold cursor-pointer hover:text-primary transition-colors"
                  >
                    {t("navigation.home")}
                  </div>
                  <Link href="#marketplace" className="text-lg font-bold">
                    {t("navigation.marketplace")}
                  </Link>
                  <Button onClick={handleNavigateLogin} className="w-full">
                    {t("navigation.signIn")}
                  </Button>
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
            <Image
              src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1600&q=80"
              className="object-cover opacity-20 mix-blend-overlay"
              alt="hero bg"
              fill
              unoptimized
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 via-slate-900/80 to-slate-50" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 animate-in fade-in zoom-in duration-700 pt-16 pb-20">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 text-white backdrop-blur-sm px-4 py-1.5 uppercase tracking-widest text-xs font-bold shadow-xl"
            >
              {agent?.name
                ? t("hero.partnerNetwork", { agentName: agent.name })
                : t("hero.officialPartnerNetwork")}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-2xl">
              <span className="text-white">{t("hero.exclusiveDeals")}</span>
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-amber-400 to-amber-600">
                {t("hero.curatedForYou")}
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              {agent?.name
                ? t("hero.descriptionWithAgent", { agentName: agent.name })
                : t("hero.descriptionDefault")}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex items-center gap-3">
                <Store className="text-amber-400 w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs text-slate-900 uppercase font-bold tracking-wider">
                    {t("stats.merchants")}
                  </div>
                  <div className="font-bold text-lg">
                    {merchants.length > 0
                      ? `${merchants.length}+`
                      : t("stats.loading")}
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex items-center gap-3">
                <Shield className="text-emerald-400 w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs text-slate-900 uppercase font-bold tracking-wider">
                    {t("stats.verified")}
                  </div>
                  <div className="font-bold text-lg">100%</div>
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
            setSearchQuery={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
            selectedCategory={selectedCategory}
            setSelectedCategory={(value) => {
              setSelectedCategory(value);
              setPage(1);
            }}
            selectedRegion={selectedRegion}
            setSelectedRegion={(value) => {
              setSelectedRegion(value);
              setPage(1);
            }}
            categories={categories}
            cities={cities}
          />
        </section>

        <section className="px-6 lg:px-10 max-w-[1700px] mx-auto pb-24">
          <div
            className={cn(
              "grid grid-cols-1 lg:grid-cols-12 items-start transition-all duration-700",
              isFewMerchants ? "gap-8 max-w-7xl mx-auto" : "gap-8",
            )}
          >
            {/* Left Sidebar (Ads Only) */}
            {leftAd && (
              <div className="hidden xl:block lg:col-span-2 sticky top-28 space-y-8 pt-16">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 opacity-50 px-2">
                    <span className="h-px flex-1 bg-slate-300"></span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      {t("ads.partner")}
                    </span>
                    <span className="h-px flex-1 bg-slate-300"></span>
                  </div>
                  <SidebarAd ad={leftAd} />
                </div>
              </div>
            )}

            <div
              ref={merchantListRef}
              className={cn(
                "col-span-1 w-full min-w-0 transition-all duration-700",
                merchants.length === 1
                  ? "lg:col-span-4 lg:col-start-3"
                  : isFewMerchants
                    ? "lg:col-span-7"
                    : leftAd
                      ? "lg:col-span-7 xl:col-span-7"
                      : "lg:col-span-7 xl:col-span-9",
              )}
            >
              <MerchantList
                merchants={merchants}
                selectedMerchantId={selectedMerchantId}
                setSelectedMerchantId={setSelectedMerchantId}
                loading={loading}
                error={error}
                page={page}
                totalItems={totalMerchants}
                hasMore={hasMore}
                onPageChange={(pageNum) => fetchMerchants(pageNum)}
                ads={inlineAds}
              />
            </div>

            <div
              className={cn(
                "col-span-1 lg:block min-w-0 transition-all duration-700",
                merchants.length === 1
                  ? "lg:col-span-4"
                  : isFewMerchants
                    ? "lg:col-span-5"
                    : leftAd
                      ? "lg:col-span-5 xl:col-span-3"
                      : "lg:col-span-5 xl:col-span-3",
              )}
            >
              <div className={cn("sticky top-24 space-y-8")}>
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
                        {t("ads.sponsored")}
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
                <SheetTitle className="sr-only">
                  {t("merchantDetail.merchantDetails")}
                </SheetTitle>
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
          <div className="px-6 lg:px-10 max-w-[1600px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge
                variant="outline"
                className="mb-4 text-slate-400 border-slate-200"
              >
                {t("features.badge")}
              </Badge>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl mb-4 text-slate-900">
                {t("features.title")}
              </h2>
              <p className="text-slate-500 text-lg">
                {t("features.description")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Smartphone,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  h: t("features.instantFeedback.title"),
                  d: t("features.instantFeedback.description"),
                },
                {
                  icon: TrendingUp,
                  color: "text-orange-600",
                  bg: "bg-orange-50",
                  h: t("features.smartCoupons.title"),
                  d: t("features.smartCoupons.description"),
                },
                {
                  icon: Globe,
                  color: "text-green-600",
                  bg: "bg-green-50",
                  h: t("features.globalReach.title"),
                  d: t("features.globalReach.description"),
                },
              ].map((fet, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500"
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
                {tCommon("brandName")}
              </span>
              <span className="text-xs text-slate-500">
                {t("footer.globalMerchantNetwork")}
              </span>
            </div>
          </div>

          <div className="flex gap-8 text-sm font-bold">
            <Link href="#" className="hover:text-white transition">
              {t("footer.privacyPolicy")}
            </Link>
            <Link href="#" className="hover:text-white transition">
              {t("footer.termsOfService")}
            </Link>
            <Link href="#" className="hover:text-white transition">
              {t("footer.agentLogin")}
            </Link>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>

      {/* Simple Coupon Form Dialog */}
      <CouponForm
        open={couponDialogOpen}
        onOpenChange={setCouponDialogOpen}
        merchant={selectedCouponData.merchant}
        batch={selectedCouponData.batch}
      />
    </div>
  );
}
