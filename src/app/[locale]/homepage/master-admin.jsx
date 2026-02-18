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
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [countries, setCountries] = useState([]);

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
            name: agent.name || agent.user?.name || t("fallback.unknownAgent"),
            email: agent.email || agent.user?.email,
            location: agent.city || agent.country || agent.address || t("fallback.global"),
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
          }));

        if (reset) {
          setAgents(transformed);
          // Extract filter options ONLY from initial unfiltered load
          // Don't update filter lists when filters are already applied
          if (selectedCountry === "all" && !searchQuery) {
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
    [searchQuery, selectedCountry, t, totalAgents],
  );

  useEffect(() => {
    fetchAgents(1, true);
  }, [fetchAgents]);

  const handleAgentClick = (agent) => {
    // Store agent data with timestamp for security validation
    const agentData = {
      ...agent,
      _timestamp: Date.now(),
      _sessionId: Math.random().toString(36).substring(7), // Simple session tracking
    };
    localStorage.setItem("selectedAgent", JSON.stringify(agentData));
    router.push(`/homepage/agent`);
  };

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
        </section>

        {/* -- Main Content Area (Agent Directory) -- */}
        <section className="bg-slate-50 py-20" id="agent-directory">
          <div className="px-6 lg:px-10 max-w-[1600px] mx-auto">
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    {t("agentDirectory.title")}
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">
                    {t("agentDirectory.description")}
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder={t("agentDirectory.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10 h-10 w-full sm:w-[250px] rounded-lg border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <Select
                    value={selectedCountry}
                    onValueChange={(val) => {
                      setSelectedCountry(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] h-10 border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 rounded-lg text-sm font-medium">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Globe className="h-3.5 w-3.5" />
                        <SelectValue placeholder={t("agentDirectory.allCountries")} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("agentDirectory.allCountries")}</SelectItem>
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
                      "overflow-y-auto scroll-smooth max-h-[800px] pr-2",
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
                          className="group bg-white rounded-4xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
  hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out cursor-pointer flex flex-col relative mb-4 hover:-translate-y-1"
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
                                {agent.merchantsCount} {t("agentDirectory.activeMerchants")}
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-auto pt-5 flex items-center justify-between text-sm font-bold text-primary transition-colors duration-300">
                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                              {t("agentDirectory.viewStorefront")}
                            </span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
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
                  <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <Users className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {t("agentDirectory.noAgentsFound")}
                    </h3>
                    <p className="text-slate-500">
                      {t("agentDirectory.tryAdjustingFilters")}
                    </p>
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
      <footer className="bg-slate-950 text-slate-400 pt-12 pb-16 px-6 lg:px-10 border-t border-slate-900">
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
    </div>
  );
}
