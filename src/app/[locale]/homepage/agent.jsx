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
import {
  TopBannerAd,
  SidebarAd,
  InlineAd,
  BottomBannerAd
} from "./components/PaidAdsDisplay";
import TableToolbar from "@/components/common/table-toolbar";
import {
  MerchantList,
  MerchantDetail
} from "./components/MerchantMarketplace";
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

  // --- PAID ADS STATE ---
  const [paidAds, setPaidAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(false);

  const fetchPaidAds = useCallback(async () => {
    if (!agent_id) return;
    setLoadingAds(true);
    try {
      const response = await axiosInstance.get(`/approvals/approved-paid-ads/admin/${agent_id}`);

      // The API now returns an array of merchant objects directly or inside .data
      const rawData = response.data?.data || (Array.isArray(response.data) ? response.data : []);

      const transformedAds = rawData
        .filter(item => item && item.id) // Filter out empty or invalid objects
        .map(item => ({
          id: item.id,
          image: item.paid_ad_image,
          placement: item.paid_ad_placement || item.settings?.paid_ad_placement || 'top',
          title: item.business_name || "Sponsored Deal",
          description: `Visit ${item.business_name} in ${item.city}, ${item.country}. Top rated ${item.business_type} marketplace.`,
          redirectUrl: `/${locale}/customer/review?mid=${item.id}`,
          cta: "VIEW PROMO",
          tagline: item.city ? `NOW IN ${item.city.toUpperCase()}` : "EXCLUSIVE OFFER",
          city: item.city,
          businessType: item.business_type
        }));

      setPaidAds(transformedAds);
    } catch (err) {
      console.error("Failed to fetch paid ads:", err);
    } finally {
      setLoadingAds(false);
    }
  }, [agent_id, locale]);

  useEffect(() => {
    fetchPaidAds();
  }, [fetchPaidAds]);

  // Fallback Mock Data matching marcadores247 theme if no real ads are fetched
  const displayAds = (Array.isArray(paidAds) && paidAds.length > 0) ? paidAds : [
    { id: 'm1', placement: 'top', title: "Header Sponsor", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80", redirectUrl: "https://www.marcadores247.com" },
    { id: 'm2', placement: 'right', title: "PRIMARY SPONSOR BANNER", image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=400&q=80", cta: "REGÍSTRATE AQUÍ" },
    { id: 'm3', placement: 'left', title: "SECONDARY SPONSOR", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80", cta: "VER MAS" },
    { id: 'm4', placement: 'inline', title: "OBTEN TU BONO DE BIENVENIDA AHORA", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80" },
    { id: 'm5', placement: 'bottom', title: "Footer Sponsor", description: "Follow our social channels for more updates.", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80" }
  ];


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
    <div className="flex min-h-screen flex-col font-sans text-slate-900 bg-white">
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
        <section className="px-6 lg:px-10 py-16 lg:py-24 flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">
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

        {/* -- Top Horizontal Sponsor Banner -- */}
        <div className="w-full">
          <TopBannerAd ad={displayAds.find(a => a.placement === 'top')} />
        </div>


        {/* -- Public Coupon Marketplace -- */}
        <section className="bg-white pb-20 pt-10" id="marketplace">
          <div className="px-6 lg:px-10 max-w-[1700px] mx-auto space-y-12">
            <div className="flex flex-col items-center max-w-3xl mx-auto space-y-4 mb-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/20">
                <TrendingUp className="w-3.5 h-3.5" /> Live Marketplace
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 pt-2">
                Explore Local Deals
              </h2>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
              <TableToolbar
                placeholder="What are you looking for?"
                onSearchChange={setSearchQuery}
                rightSlot={
                  <div className="flex gap-2 w-full lg:w-auto flex-col sm:flex-row">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-[200px] h-10 bg-slate-50 border-input focus:ring-0 focus:border-ring rounded-md text-sm">
                        <SelectValue placeholder="Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="w-full sm:w-[180px] h-10 bg-slate-50 border-input focus:ring-0 focus:border-ring rounded-md text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <SelectValue placeholder="Location" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everywhere</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                }
              />
            </div>

            <div className="flex flex-col xl:flex-row gap-8 relative items-start">
              {/* Main Marketplace Grid */}
              <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-[700px]">
                <MerchantList
                  merchants={filteredMerchants}
                  selectedMerchantId={selectedMerchantId}
                  setSelectedMerchantId={setSelectedMerchantId}
                  loading={loading}
                  error={error}
                  hasMore={hasMore}
                  handleLoadMore={handleLoadMore}
                  loadingMore={loadingMore}
                  ads={displayAds.filter(a => a.placement === 'inline')}
                />

                <MerchantDetail
                  activeMerchant={activeMerchant}
                  handleGetCoupon={handleGetCoupon}
                />
              </div>

              {/* Right Sidebar Ad (Sticky) */}
              <div className="hidden lg:block w-72 shrink-0">
                <SidebarAd ad={displayAds.find(a => a.placement === 'right')} placement="right" />
              </div>
            </div>
          </div>
        </section>

        {/* -- Features -- */}
        <section className="bg-white py-20 lg:py-32">
          <div className="px-6 lg:px-10 max-w-[1700px] mx-auto flex flex-col xl:flex-row gap-12 items-start">
            {/* Left Sidebar Ad for Features Section */}
            <div className="hidden xl:block w-[300px] shrink-0">
              <SidebarAd ad={displayAds.find(a => a.placement === 'left')} placement="left" />
            </div>

            <div className="flex-1">
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
          </div>
        </section>

        {/* Bottom Sponsor Strip */}
        <BottomBannerAd ad={displayAds.find(a => a.placement === 'bottom')} />
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
    </div>
  );
}
