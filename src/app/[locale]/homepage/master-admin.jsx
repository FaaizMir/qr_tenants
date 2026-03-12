"use client";

import { useRouter, Link } from "@/i18n/routing";
import {
  ArrowRight,
  QrCode,
  Globe,
  Search,
  MapPin,
  Store,
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  TicketPercent,
  Gift,
  CalendarDays,
  Tag,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import TableToolbar from "@/components/common/table-toolbar";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useEffect, useState, useMemo, useCallback } from "react";
import useDebounce from "@/hooks/useDebounceRef";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils/imageUtils";
import {
  TopBannerAd,
  SidebarAd,
  BottomBannerAd,
} from "./components/PaidAdsDisplay";
import { CouponForm } from "./components/CouponForm";

// --- Main Page Component ---
export default function MasterAdminLandingPage() {
  const t = useTranslations("Homepage.masterAdmin");
  const tCommon = useTranslations("Homepage.common");
  const locale = useLocale();
  const router = useRouter();

  const [selectedAgent, setSelectedAgent] = useState(null);

  // Refs
  const agentListRef = useRef(null);

  // Data State
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [countries, setCountries] = useState([]);

  // Homepage push display state
  const [homepageCoupons, setHomepageCoupons] = useState([]);
  const [homepageAds, setHomepageAds] = useState([]);

  // Coupon dialog
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [selectedCouponData, setSelectedCouponData] = useState({
    merchant: null,
    batch: null,
  });

  const handleGetCoupon = (merchant, batch) => {
    setSelectedCouponData({ merchant, batch });
    setCouponDialogOpen(true);
  };

  // Coupon section pagination + search
  const COUPONS_PER_PAGE = 9;
  const [couponPage, setCouponPage] = useState(1);
  const [couponSearch, setCouponSearch] = useState("");
  const debouncedCouponSearch = useDebounce(couponSearch, 400);

  const normalizeHomepageAdPlacement = (placement) => {
    const normalized = String(placement || "")
      .trim()
      .toLowerCase();
    const mapped = {
      homepage_ad_slot_1: "top",
      homepage_ad_slot_2: "left",
      homepage_ad_slot_3: "right",
      homepage_ad_slot_4: "bottom",
    };
    return mapped[normalized] || normalized || "top";
  };

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalAgents, setTotalAgents] = useState(0);

  // Mocked Platform Stats (since real endpoint might not exist yet)
  const stats = [
    {
      label: t("stats.activeAgents"),
      value: agents.length || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: t("stats.totalMerchants"),
      value: agents.reduce((acc, curr) => acc + (curr.merchantsCount || 0), 0),
      icon: Store,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: t("stats.globalReach"),
      value: countries.length,
      icon: Globe,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  const fetchAgents = useCallback(
    async (pageNum = 1, reset = false) => {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = {
          page: pageNum,
          pageSize: 6,
        };

        // Add search parameter (searches agent name)
        if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
          params.search = debouncedSearchQuery.trim();
        }

        // Add country parameter (searches agent's country)
        if (selectedCountry && selectedCountry !== "all") {
          params.country = selectedCountry;
        }

        // Add expiringSoon parameter
        if (expiringSoon) {
          params.expiringSoon = true;
        }

        const response = await axiosInstance.get("/coupons/super-admin-feed", {
          params,
        });

        const agentsData = response.data?.data?.admins || [];

        const transformed = agentsData
          .filter((agent) => agent && agent.id)
          .slice(0, 6) // Ensure max 6 agents per page
          .map((agent) => ({
            id: agent.id,
            name: agent.name || agent.user?.name || t("fallback.unknownAgent"),
            email: agent.email || agent.user?.email,
            location:
              agent.city ||
              agent.country ||
              agent.address ||
              t("fallback.global"),
            country: agent.country || t("fallback.unknown"),
            status:
              agent.is_active === true ||
              agent.is_active === 1 ||
              agent.user?.is_active === true ||
              agent.user?.is_active === 1
                ? t("status.active")
                : t("status.inactive"),
            joined: new Date().toLocaleDateString(),
            merchantsCount: agent.merchants?.length || 0,
            company_name: agent.company_name || t("fallback.unknownAgent"),
          }));

        if (reset) {
          setAgents(transformed);
          // Extract filter options ONLY from initial unfiltered load
          // Don't update filter lists when filters are already applied
          if (selectedCountry === "all" && !debouncedSearchQuery) {
            const uniqueCountries = [
              ...new Set(transformed.map((a) => a.country)),
            ]
              .filter(Boolean)
              .sort();
            setCountries(uniqueCountries);
          }
        } else {
          setAgents(transformed);
        }

        // Update pagination state
        setHasMore(transformed.length === 6);
        setTotalAgents(
          response.data?.pagination?.total ||
            (pageNum === 1 ? transformed.length : totalAgents),
        );
        setPage(pageNum);
      } catch (err) {
        console.error(err);
        setError(t("errors.failedToLoadAgents"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearchQuery, selectedCountry, expiringSoon, t, totalAgents],
  );

  const fetchHomepagePlacements = useCallback(async () => {
    try {
      const [couponResp, adResp] = await Promise.all([
        axiosInstance.get("/approvals/homepage-coupons"),
        axiosInstance.get("/approvals/homepage-ads"),
      ]);

      const couponsData = couponResp?.data?.data || couponResp?.data || [];
      const adsData = adResp?.data?.data || adResp?.data || [];

      const couponsList = Array.isArray(couponsData) ? couponsData : [];
      const adsList = Array.isArray(adsData) ? adsData : [];

      setHomepageCoupons(couponsList);

      const transformedAds = adsList
        .filter(
          (item) => item && (item.id || item.merchant_id || item.merchant?.id),
        )
        .filter((item) => {
          const hasImage =
            item.paid_ad_image ||
            item.merchant?.settings?.paid_ad_image ||
            item.merchant?.paid_ad_image;
          const hasVideo =
            item.paid_ad_video || item.merchant?.settings?.paid_ad_video;
          return hasImage || hasVideo;
        })
        .map((item) => ({
          id: item.merchant_id || item.merchant?.id || item.id,
          image:
            item.paid_ad_image ||
            item.merchant?.settings?.paid_ad_image ||
            item.merchant?.paid_ad_image ||
            null,
          video:
            item.paid_ad_video ||
            item.merchant?.settings?.paid_ad_video ||
            null,
          isVideo:
            item.paid_ad_video_status ||
            item.merchant?.settings?.paid_ad_video_status ||
            false,
          placement: normalizeHomepageAdPlacement(
            item.paid_ad_placement ||
              item.placement ||
              item.merchant?.settings?.paid_ad_placement,
          ),
          title: item.merchant?.business_name || t("ads.sponsoredDeal"),
          description: item.merchant?.city
            ? t("ads.visitBusiness", {
                businessName: item.merchant?.business_name,
                city: item.merchant?.city,
                country: item.merchant?.country || "",
              })
            : t("ads.discoverPartner"),
          cta: t("ads.viewOffer"),
          tagline: item.merchant?.city
            ? t("ads.exclusiveIn", {
                city: String(item.merchant.city).toUpperCase(),
              })
            : t("ads.limitedTime"),
          city: item.merchant?.city,
          businessType: item.merchant?.business_type,
        }));

      setHomepageAds(transformedAds);
    } catch (err) {
      console.error("Failed to load homepage placements:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAgents(1, true);
  }, [fetchAgents]);

  useEffect(() => {
    fetchHomepagePlacements();
  }, [fetchHomepagePlacements]);

  // Trigger search when filters change (debounced search query)
  useEffect(() => {
    fetchAgents(1, true);
  }, [debouncedSearchQuery, fetchAgents, selectedCountry, expiringSoon]);

  const handleAgentClick = (agent) => {
    router.push(`/homepage/${agent.company_name}`);
  };

  // Filtered + paginated coupons
  const filteredCoupons = useMemo(() => {
    if (!debouncedCouponSearch.trim()) return homepageCoupons;
    const q = debouncedCouponSearch.toLowerCase();
    return homepageCoupons.filter((a) => {
      const name = a?.coupon?.batch?.batch_name || "";
      const desc = a?.coupon?.batch?.description || "";
      return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
  }, [homepageCoupons, debouncedCouponSearch]);

  const totalCouponPages = Math.max(
    1,
    Math.ceil(filteredCoupons.length / COUPONS_PER_PAGE),
  );
  const paginatedCoupons = useMemo(() => {
    const start = (couponPage - 1) * COUPONS_PER_PAGE;
    return filteredCoupons.slice(start, start + COUPONS_PER_PAGE);
  }, [filteredCoupons, couponPage]);

  const topHomepageAd =
    homepageAds.find(
      (a) => normalizeHomepageAdPlacement(a.placement) === "top",
    ) ||
    homepageAds[0] ||
    null;
  const leftHomepageAd =
    homepageAds.find(
      (a) => normalizeHomepageAdPlacement(a.placement) === "left",
    ) || null;
  const rightHomepageAd =
    homepageAds.find((a) => {
      const placement = normalizeHomepageAdPlacement(a.placement);
      return placement === "right" || placement === "sidebar";
    }) || null;
  const bottomHomepageAd =
    homepageAds.find(
      (a) => normalizeHomepageAdPlacement(a.placement) === "bottom",
    ) || null;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* -- Navigation -- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 transition-all">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              {tCommon("brandName")}
            </span>
          </div>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[14px] font-bold tracking-tight">
            <Link
              href="#platform-stats"
              className="text-slate-500 hover:text-primary transition-colors"
            >
              {t("navigation.overview")}
            </Link>
            <Link
              href="#agent-directory"
              className="text-slate-500 hover:text-primary transition-colors"
            >
              {t("navigation.directory")}
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
              onClick={() => router.push("/login")}
            >
              {t("navigation.signIn")}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 -mt-4 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* -- KPIS & HERO COMPACT -- */}
        <section
          className="bg-white pt-12 pb-20 px-6 lg:px-10 border-b border-slate-100"
          id="platform-stats"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-16">
              <div className="max-w-2xl">
                <Badge
                  variant="outline"
                  className="mb-4 bg-primary/5 text-primary border-primary/20"
                >
                  {t("hero.badge")}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                  {t("hero.title")} <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
                    {t("hero.titleHighlight")}
                  </span>
                </h1>
                <p className="mt-4 text-lg text-slate-500 max-w-lg">
                  {t("hero.description")}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] min-w-[140px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                  >
                    <div className={`p-2 rounded-lg w-fit mb-3 ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {stat.value}
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {topHomepageAd && (
            <div className="relative z-10 px-6 lg:px-10 max-w-[1600px] mx-auto mt-8 mb-4">
              <div className="flex items-center gap-2 mb-6 opacity-60 justify-center">
                <span className="h-px w-24 bg-slate-300"></span>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-[0.2em]">
                  {t("ads.sponsored")}
                </span>
                <span className="h-px w-24 bg-slate-300"></span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl"></div>
                <div className="relative">
                  <TopBannerAd
                    ad={topHomepageAd}
                    translationNamespace="Homepage.masterAdmin.ads"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
        {/* -- Super Admin Homepage Placements (Coupon Batches + Left Ad) -- */}
        {(homepageCoupons.length > 0 || leftHomepageAd) && (
          <section className="bg-white py-20 border-t border-slate-100">
            <div className="px-6 lg:px-10 max-w-[1600px] mx-auto">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Left sidebar ad */}
                {leftHomepageAd && (
                  <div className="hidden xl:block xl:col-span-2 sticky top-28">
                    <div className="flex items-center gap-2 mb-3 opacity-50 px-1">
                      <span className="h-px flex-1 bg-slate-200"></span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        {t("ads.sponsored")}
                      </span>
                      <span className="h-px flex-1 bg-slate-200"></span>
                    </div>
                    <SidebarAd
                      ad={leftHomepageAd}
                      placement="left"
                      translationNamespace="Homepage.masterAdmin.ads"
                    />
                  </div>
                )}

                {/* Main coupons area */}
                <div
                  className={cn(
                    "col-span-1 space-y-8",
                    leftHomepageAd ? "xl:col-span-10" : "xl:col-span-12",
                  )}
                >
                  {/* Section header */}
                  <div className="flex flex-col items-center gap-5 text-center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-primary/5 text-primary border-primary/20 text-[11px] uppercase tracking-widest font-bold px-3 py-1"
                        >
                          {t("couponBatches.title")}
                        </Badge>
                        {homepageCoupons.length > 0 && (
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                            {homepageCoupons.length}{" "}
                            {t("couponBatches.batches")}
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                        {t("couponBatches.subtitle")}
                      </h2>
                      <p className="text-slate-500 font-medium max-w-full mx-auto">
                        {t("couponBatches.description")}
                      </p>
                    </div>

                    {homepageCoupons.length > 0 && (
                      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] p-2.5 flex items-center gap-2 w-full max-w-lg mx-auto">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder={t("couponBatches.searchPlaceholder")}
                            value={couponSearch}
                            onChange={(e) => {
                              setCouponSearch(e.target.value);
                              setCouponPage(1);
                            }}
                            className="pl-9 pr-4 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Coupon Grid */}
                  {paginatedCoupons.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedCoupons.map((approval) => {
                          const batch = approval?.coupon?.batch;
                          const merchant = approval?.merchant;
                          if (!batch) return null;

                          const brandImage =
                            batch.brand_image ||
                            approval.coupon?.brand_image ||
                            null;
                          const logoUrl = getImageUrl(brandImage);
                          const templateHtml = batch.template?.html;
                          const renderedHtml = templateHtml
                            ? templateHtml
                                .replace(/\{\{logo\}\}/g, logoUrl)
                                .replace(
                                  /\{\{header\}\}/g,
                                  batch.header || batch.batch_name || "",
                                )
                                .replace(
                                  /\{\{title\}\}/g,
                                  batch.title || batch.batch_name || "",
                                )
                                .replace(
                                  /\{\{description\}\}/g,
                                  batch.description || "",
                                )
                            : null;

                          const remaining =
                            batch.total_quantity != null &&
                            batch.issued_quantity != null
                              ? batch.total_quantity - batch.issued_quantity
                              : null;

                          const endDate = batch.end_date
                            ? new Date(batch.end_date).toLocaleDateString(
                                locale,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : null;

                          const merchantForForm = merchant
                            ? {
                                ...merchant,
                                name:
                                  merchant.business_name ||
                                  merchant.name ||
                                  t("fallback.unknownAgent"),
                              }
                            : null;

                          return (
                            <div
                              key={approval.id}
                              className="group h-[270px] w-[450px] bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col items-center justify-center overflow-hidden"
                            >
                              {/* Template / brand image */}
                              <div className="relative p-6 w-full">
                                <span className="absolute top-3 end-3 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                                  {t("couponBatches.active")}
                                </span>
                                {renderedHtml ? (
                                  <div
                                    className="w-full pointer-events-none"
                                    dangerouslySetInnerHTML={{
                                      __html: renderedHtml,
                                    }}
                                  />
                                ) : brandImage ? (
                                  <div className="w-full aspect-video overflow-hidden rounded-xl bg-slate-100">
                                    <img
                                      src={logoUrl}
                                      alt={batch.batch_name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full aspect-video flex items-center justify-center rounded-xl bg-primary/5">
                                    <TicketPercent className="h-12 w-12 text-primary/30" />
                                  </div>
                                )}
                              </div>

                              {/* Details */}
                              <div className="px-4 pb-4 pt-0 flex flex-col gap-3 flex-1 border-t border-slate-100 w-full">
                                {!renderedHtml && (
                                  <div className="pt-3">
                                    <h3 className="font-bold text-slate-900 line-clamp-1">
                                      {batch.batch_name}
                                    </h3>
                                    {batch.description && (
                                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                                        {batch.description}
                                      </p>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-500 pt-3">
                                  {endDate && (
                                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                                      <CalendarDays className="h-3 w-3 text-slate-400 shrink-0" />
                                      {t("couponBatches.expires")} {endDate}
                                    </span>
                                  )}
                                  {remaining != null && (
                                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                                      <Tag className="h-3 w-3 text-slate-400 shrink-0" />
                                      {remaining} {t("couponBatches.remaining")}
                                    </span>
                                  )}
                                </div>

                                <Button
                                  size="sm"
                                  className="mt-auto w-full gap-2 rounded-xl font-bold shadow-md shadow-primary/20"
                                  onClick={() =>
                                    handleGetCoupon(merchantForForm, batch)
                                  }
                                >
                                  <Gift className="h-4 w-4" />
                                  {t("couponBatches.getCoupon")}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {totalCouponPages > 1 && (
                        <div className="flex flex-col items-center gap-4 pt-8">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
                              onClick={() =>
                                setCouponPage((p) => Math.max(1, p - 1))
                              }
                              disabled={couponPage === 1}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </Button>

                            <div className="flex items-center gap-1.5 px-2">
                              {Array.from({ length: totalCouponPages }).map(
                                (_, i) => {
                                  const pg = i + 1;
                                  if (
                                    pg === 1 ||
                                    pg === totalCouponPages ||
                                    (pg >= couponPage - 1 &&
                                      pg <= couponPage + 1)
                                  ) {
                                    return (
                                      <Button
                                        key={pg}
                                        variant={
                                          couponPage === pg
                                            ? "default"
                                            : "outline"
                                        }
                                        size="icon"
                                        className={cn(
                                          "w-10 h-10 rounded-xl font-bold transition-all text-sm",
                                          couponPage === pg
                                            ? "bg-primary text-white shadow-lg shadow-primary/25 border-primary scale-110 z-10"
                                            : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 shadow-sm",
                                        )}
                                        onClick={() => setCouponPage(pg)}
                                      >
                                        {pg}
                                      </Button>
                                    );
                                  } else if (
                                    (pg === 2 && couponPage > 3) ||
                                    (pg === totalCouponPages - 1 &&
                                      couponPage < totalCouponPages - 2)
                                  ) {
                                    return (
                                      <span
                                        key={pg}
                                        className="px-1 text-slate-400 font-bold"
                                      >
                                        ...
                                      </span>
                                    );
                                  }
                                  return null;
                                },
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
                              onClick={() =>
                                setCouponPage((p) =>
                                  Math.min(totalCouponPages, p + 1),
                                )
                              }
                              disabled={couponPage === totalCouponPages}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>

                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                            {t("couponBatches.showingBatches", {
                              start: (couponPage - 1) * COUPONS_PER_PAGE + 1,
                              end: Math.min(
                                couponPage * COUPONS_PER_PAGE,
                                filteredCoupons.length,
                              ),
                              total: filteredCoupons.length,
                            })}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <TicketPercent className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-600">
                        {couponSearch
                          ? t("couponBatches.noBatchesFound")
                          : t("couponBatches.noActiveBatches")}
                      </p>
                      {couponSearch && (
                        <button
                          onClick={() => setCouponSearch("")}
                          className="mt-3 text-sm text-primary font-bold hover:underline"
                        >
                          {t("couponBatches.clearSearch")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* -- Main Content Area (Agent Directory) -- */}
        <section
          className="relative bg-linear-to-b from-slate-50 to-white py-20 overflow-hidden"
          id="agent-directory"
        >
          {/* Decorative background blobs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-primary/3 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-500/3 rounded-full blur-3xl pointer-events-none" />

          <div className="relative px-6 lg:px-10 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start justify-center">
              {/* Main content */}
              <div
                className={cn(
                  "col-span-1 space-y-8 animate-in fade-in duration-500",
                  rightHomepageAd ? "xl:col-span-10" : "xl:col-span-12",
                )}
              >
                {/* Section Header */}
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 text-[11px] uppercase tracking-widest font-bold px-3 py-1"
                      >
                        {t("agentDirectory.title")}
                      </Badge>
                      {totalAgents > 0 && (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                          {totalAgents} {t("agentDirectory.total")}
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                      {t("agentDirectory.description")}
                    </h2>
                  </div>

                  {/* Filter Bar Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] p-2.5 flex flex-row items-center gap-2 w-full max-w-4xl mx-auto">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t("agentDirectory.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                      />
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-slate-200 self-stretch my-0.5" />

                    {/* Country */}
                    <Select
                      value={selectedCountry}
                      onValueChange={(val) => setSelectedCountry(val)}
                    >
                      <SelectTrigger className="w-[150px] h-9 border-slate-200 bg-slate-50 hover:bg-white rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all shrink-0">
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <SelectValue
                            placeholder={t("agentDirectory.allCountries")}
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("agentDirectory.allCountries")}
                        </SelectItem>
                        {countries.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Divider */}
                    <div className="w-px bg-slate-200 self-stretch my-0.5" />

                    {/* Expiring Soon Toggle */}
                    <button
                      onClick={() => setExpiringSoon(!expiringSoon)}
                      className={cn(
                        "h-9 px-4 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border",
                        expiringSoon
                          ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300",
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          expiringSoon
                            ? "bg-white animate-pulse"
                            : "bg-slate-400",
                        )}
                      />
                      {expiringSoon
                        ? t("agentDirectory.expiringSoonActive")
                        : t("agentDirectory.expiringSoon")}
                    </button>
                  </div>
                </div>

                {/* Agents Grid */}
                {loading ? (
                  <div className="py-24 flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-400">
                      {t("agentDirectory.loadingAgents")}
                    </p>
                  </div>
                ) : agents.length > 0 ? (
                  <>
                    {/* Scrollable Container */}
                    <div
                      ref={agentListRef}
                      className={cn(
                        "overflow-y-auto scroll-smooth max-h-[860px] pr-2 -mr-2",
                        "[&::-webkit-scrollbar]:w-1.5",
                        "[&::-webkit-scrollbar-track]:bg-transparent",
                        "[&::-webkit-scrollbar-thumb]:bg-slate-200",
                        "[&::-webkit-scrollbar-thumb]:rounded-full",
                        "[&::-webkit-scrollbar-thumb]:hover:bg-slate-300",
                      )}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {agents.map((agent) => (
                          <div
                            key={agent.id}
                            onClick={() => handleAgentClick(agent)}
                            className="group bg-white p-8 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col"
                          >
                            {/* Icon */}
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 text-xl font-black group-hover:scale-105 transition-transform duration-300">
                              {agent.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold mb-3 text-slate-900 line-clamp-1">
                              {agent.name}
                            </h3>

                            {/* Info */}
                            <div className="flex flex-col gap-1.5 mb-6 flex-1">
                              <p className="text-slate-500 font-medium flex items-center gap-1.5 text-sm">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {agent.location || "—"}
                              </p>
                              <p className="text-slate-500 font-medium flex items-center gap-1.5 text-sm">
                                <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {agent.merchantsCount}{" "}
                                {t("agentDirectory.activeMerchants")}
                              </p>
                            </div>

                            {/* CTA */}
                            <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-sm font-bold text-primary group-hover:translate-x-0.5 transition-transform duration-200">
                                {t("agentDirectory.viewStorefront")}
                              </span>
                              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pagination */}
                    {(totalAgents > 6 || hasMore || page > 1) && (
                      <div className="flex flex-col items-center gap-6 pt-12 pb-8">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
                            onClick={() => fetchAgents(page - 1)}
                            disabled={page === 1 || loading}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </Button>

                          <div className="flex items-center gap-1.5 px-2">
                            {Array.from({
                              length: Math.max(
                                page,
                                hasMore && totalAgents <= page * 6
                                  ? page + 1
                                  : Math.ceil(totalAgents / 6),
                              ),
                            }).map((_, i) => {
                              const pageNum = i + 1;
                              const totalPages = Math.max(
                                page,
                                hasMore && totalAgents <= page * 6
                                  ? page + 1
                                  : Math.ceil(totalAgents / 6),
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
                                    variant={
                                      page === pageNum ? "default" : "outline"
                                    }
                                    size="icon"
                                    className={cn(
                                      "w-10 h-10 rounded-xl font-bold transition-all text-sm tracking-tight",
                                      page === pageNum
                                        ? "bg-primary text-white shadow-lg shadow-primary/25 border-primary scale-110 z-10"
                                        : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 shadow-sm",
                                    )}
                                    onClick={() => fetchAgents(pageNum)}
                                    disabled={loading}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              } else if (
                                (pageNum === 2 && page > 3) ||
                                (pageNum === totalPages - 1 &&
                                  page < totalPages - 2)
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
                            onClick={() => fetchAgents(page + 1)}
                            disabled={!hasMore || loading}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>

                        {totalAgents > 0 && (
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                            {totalAgents <= page * 6 && hasMore
                              ? `${t("agentDirectory.showingPage")} ${page}`
                              : `${t("agentDirectory.showing")} ${(page - 1) * 6 + 1} - ${Math.min(page * 6, totalAgents)} ${t("agentDirectory.of")} ${totalAgents} ${t("agentDirectory.agents")}`}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-slate-50/80 to-white pointer-events-none" />
                      <div className="relative">
                        <div className="bg-linear-to-br from-slate-100 to-slate-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-inner">
                          <Users className="h-9 w-9 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">
                          {t("agentDirectory.noAgentsFound")}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium">
                          {t("agentDirectory.tryAdjustingFilters")}
                        </p>
                      </div>
                    </div>

                    {/* Pagination for empty results when not on page 1 */}
                    {page > 1 && (
                      <div className="flex flex-col items-center gap-6 pt-12 pb-8">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-30 shadow-sm"
                            onClick={() => fetchAgents(page - 1)}
                            disabled={page === 1 || loading}
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
                                    variant={
                                      page === pageNum ? "default" : "outline"
                                    }
                                    size="icon"
                                    className={cn(
                                      "w-10 h-10 rounded-xl font-bold transition-all text-sm tracking-tight",
                                      page === pageNum
                                        ? "bg-primary text-white shadow-lg shadow-primary/25 border-primary scale-110 z-10"
                                        : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 shadow-sm",
                                    )}
                                    onClick={() => fetchAgents(pageNum)}
                                    disabled={loading}
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
                            onClick={() => fetchAgents(page + 1)}
                            disabled={true}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>

                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                          {t("agentDirectory.pageNoResults")} {page}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right Sidebar Ad */}
              {rightHomepageAd && (
                <div className="hidden xl:block xl:col-span-2 sticky top-28 space-y-4">
                  <div className="flex items-center gap-2 mb-2 opacity-50 px-2">
                    <span className="h-px flex-1 bg-slate-300"></span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      {t("ads.sponsored")}
                    </span>
                    <span className="h-px flex-1 bg-slate-300"></span>
                  </div>
                  <SidebarAd
                    ad={rightHomepageAd}
                    placement="right"
                    translationNamespace="Homepage.masterAdmin.ads"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* -- Features -- */}
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
                  h: t("features.whatsappAutomation.title"),
                  d: t("features.whatsappAutomation.description"),
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
      </main>

      {/* -- Footer -- */}
      <footer className="bg-slate-950 text-slate-400 pt-10 pb-7 px-6 lg:px-10 border-t border-slate-900">
        {/* Bottom Ad Banner - Prominent in Footer */}
        {bottomHomepageAd && (
          <div className="max-w-[1600px] mx-auto mb-12">
            <div className="flex items-center gap-2 mb-4 opacity-60 justify-center">
              <span className="h-px w-24 bg-slate-700"></span>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-[0.2em]">
                {t("ads.sponsored")}
              </span>
              <span className="h-px w-24 bg-slate-700"></span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 to-transparent rounded-3xl blur-2xl"></div>
              <div className="relative">
                <BottomBannerAd
                  ad={bottomHomepageAd}
                  translationNamespace="Homepage.masterAdmin.ads"
                />
              </div>
            </div>
          </div>
        )}

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
              {t("footer.privacy")}
            </Link>
            <Link href="#" className="hover:text-white transition">
              {t("footer.terms")}
            </Link>
            <Link href="#" className="hover:text-white transition">
              {t("footer.contact")}
            </Link>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            {t("footer.copyright")}
          </div>
        </div>
      </footer>

      {/* Coupon Form Dialog */}
      <CouponForm
        open={couponDialogOpen}
        onOpenChange={setCouponDialogOpen}
        merchant={selectedCouponData.merchant}
        batch={selectedCouponData.batch}
      />
    </div>
  );
}
