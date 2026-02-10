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
} from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import TableToolbar from "@/components/common/table-toolbar";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useEffect, useState, useMemo, useCallback } from "react";
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
import { TopBannerAd } from "./components/PaidAdsDisplay";

// --- Main Page Component ---
export default function MasterAdminLandingPage() {
  const tHeroSection = useTranslations("Homepage.heroSection");
  const tFeatures = useTranslations("Homepage.fetaures");
  const tFooter = useTranslations("Homepage.footer");
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
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [countries, setCountries] = useState([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalAgents, setTotalAgents] = useState(0);

  // Mocked Platform Stats (since real endpoint might not exist yet)
  const stats = [
    {
      label: "Active Agents",
      value: agents.length || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Merchants",
      value: agents.reduce((acc, curr) => acc + (curr.merchantsCount || 0), 0),
      icon: Store,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Global Reach",
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
        const response = await axiosInstance.get("/coupons/super-admin-feed", {
          params: {
            page: pageNum,
            pageSize: 6, // Fetch 6 agents per page
            search: searchQuery,
            country: selectedCountry === "all" ? undefined : selectedCountry,
          },
        });

        const agentsData = response.data?.data?.admins || [];

        const transformed = agentsData
          .filter((agent) => agent && agent.id)
          .slice(0, 6) // Ensure max 6 agents per page
          .map((agent) => ({
            id: agent.id,
            name: agent.name || agent.user?.name || "Unknown Agent",
            email: agent.email || agent.user?.email,
            location: agent.city || agent.country || agent.address || "Global",
            country: agent.country || "Unknown",
            status:
              agent.is_active === true ||
              agent.is_active === 1 ||
              agent.user?.is_active === true ||
              agent.user?.is_active === 1
                ? "active"
                : "inactive",
            joined: new Date().toLocaleDateString(),
            merchantsCount: agent.merchants?.length || 0,
          }));

        if (reset) {
          setAgents(transformed);
          // Extract filter options from first page
          const uniqueCountries = [
            ...new Set(transformed.map((a) => a.country)),
          ]
            .filter(Boolean)
            .sort();
          setCountries(uniqueCountries);
        } else {
          setAgents((prev) => [...prev, ...transformed]);
        }

        // Update pagination state
        setHasMore(transformed.length === 6);
        setTotalAgents(response.data?.pagination?.total || transformed.length);
        setPage(pageNum);
      } catch (err) {
        console.error(err);
        setError("Failed to load agents.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, selectedCountry],
  );

  useEffect(() => {
    fetchAgents(1, true);
  }, [fetchAgents]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchAgents(page + 1, false);
      // Scroll to agent list after a short delay
      setTimeout(() => {
        agentListRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  };

  const handleAgentClick = (agent) => {
    router.push(`/homepage/agent?agentId=${agent.id}`);
  };

  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900 bg-slate-50/50">
      {/* -- Navigation -- */}
      <header className="px-6 lg:px-10 py-4 flex items-center justify-between border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-2 font-bold text-xl cursor-pointer">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <QrCode className="h-5 w-5" />
          </div>
          <span className="tracking-tight">QR Rev</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4 text-sm font-medium text-slate-600">
            <Link
              href="#platform-stats"
              className="hover:text-primary transition-colors"
            >
              Overview
            </Link>
            <Link
              href="#agent-directory"
              className="hover:text-primary transition-colors"
            >
              Directory
            </Link>
            <Link
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </Link>
          </div>
          <LanguageSwitcher />
          <Link
            href={`/login`}
            className="text-sm font-bold hover:text-primary transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <Link href={`/login`}>
            <Button className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
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
                  Master Admin Control
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                  Platform <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
                    Intelligence Center
                  </span>
                </h1>
                <p className="mt-4 text-lg text-slate-500 max-w-lg">
                  Monitor global agent performance, manage territory
                  distribution, and oversee merchant network growth from a
                  single dashboard.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-w-[140px]"
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
        </section>

        {/* -- Main Content Area (Agent Directory) -- */}
        <section className="bg-slate-50 py-20" id="agent-directory">
          <div className="px-6 lg:px-10 max-w-[1600px] mx-auto">
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    Agent Directory
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">
                    Manage your global network of tenant agents.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search agents..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 h-10 w-full sm:w-[250px] rounded-lg border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <Select
                    value={selectedCountry}
                    onValueChange={(val) => setSelectedCountry(val)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] h-10 border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 rounded-lg text-sm font-medium">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Globe className="h-3.5 w-3.5" />
                        <SelectValue placeholder="All Countries" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Agents Grid */}
              {loading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : agents.length > 0 ? (
                <>
                  {/* Scrollable Container - Fixed height for 6 agents */}
                  <div
                    ref={agentListRef}
                    className={cn(
                      "overflow-y-auto scroll-smooth h-[800px] pr-2",
                      // Custom scrollbar styles
                      "[&::-webkit-scrollbar]:w-2",
                      "[&::-webkit-scrollbar-track]:bg-slate-100",
                      "[&::-webkit-scrollbar-track]:rounded-full",
                      "[&::-webkit-scrollbar-thumb]:bg-slate-300",
                      "[&::-webkit-scrollbar-thumb]:rounded-full",
                      "[&::-webkit-scrollbar-thumb]:hover:bg-slate-400",
                    )}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                      {agents.map((agent) => (
                        <div
                          key={agent.id}
                          onClick={() => handleAgentClick(agent)}
                          className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-md 
  hover:shadow-xl  transition-all duration-300 ease-out cursor-pointer flex flex-col relative mb-2"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-black text-primary transition-all duration-300">
                              {agent.name.charAt(0)}
                            </div>
                            <Badge
                              variant={
                                agent.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className={cn(
                                "uppercase text-[10px] tracking-widest font-bold px-2.5 py-1 border-0",
                                agent.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-500",
                              )}
                            >
                              {agent.status}
                            </Badge>
                          </div>

                          {/* Content */}
                          <div className="mb-6 flex-1 space-y-3">
                            <h3 className="font-bold text-lg text-slate-900 line-clamp-1 tracking-tight">
                              {agent.name}
                            </h3>

                            <div className="space-y-2.5">
                              <div className="flex items-center text-xs font-medium text-slate-500">
                                <MapPin className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                {agent.location}
                              </div>
                              <div className="flex items-center text-xs font-medium text-slate-500">
                                <Store className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                {agent.merchantsCount} Active Merchants
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-primary transition-colors duration-300">
                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                              View Storefront
                            </span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center pt-8">
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
                          "Load More Agents"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    No agents found
                  </h3>
                  <p className="text-slate-500">Try adjusting your filters.</p>
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
                Platform Features
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
                  className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300"
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
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 font-bold text-xl text-white">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <QrCode className="h-4 w-4" />
            </div>
            QR Rev
          </div>
          <div className="text-sm font-medium">{tFooter("text")}</div>
          <div className="flex gap-8 text-sm font-bold">
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
