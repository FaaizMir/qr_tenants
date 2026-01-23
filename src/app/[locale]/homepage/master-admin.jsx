"use client";

import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import TableToolbar from "@/components/common/table-toolbar";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useEffect, useState, useMemo } from "react";
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

  // Data State
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [countries, setCountries] = useState([]);

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/coupons/super-admin-feed");
        // Check structure
        const agentsData = response.data?.data?.admins || [];

        const transformed = agentsData.map((agent) => ({
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
        setAgents(transformed);

        const uniqueCountries = [...new Set(transformed.map((a) => a.country))]
          .filter(Boolean)
          .sort();
        setCountries(uniqueCountries);
      } catch (err) {
        console.error(err);
        setError("Failed to load agents.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  // Use Memo for filtering to avoid re-calc
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCountry =
        selectedCountry === "all" || agent.country === selectedCountry;
      return matchSearch && matchCountry;
    });
  }, [agents, searchQuery, selectedCountry]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleAgentClick = (agent) => {
    router.push(`/${locale}/homepage/agent?agentId=${agent.id}`);
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
            href={`/${locale}/login`}
            className="text-sm font-bold hover:text-primary transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <Link href={`/${locale}/login`}>
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
                    onValueChange={(val) => {
                      setSelectedCountry(val);
                      setCurrentPage(1);
                    }}
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
              ) : filteredAgents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedAgents.map((agent) => (
                      <div
                        key={agent.id}
                        onClick={() => handleAgentClick(agent)}
                        className="
    group bg-white rounded-3xl p-1
    shadow-sm hover:shadow-xl
    transition-all duration-300
    cursor-pointer flex flex-col relative
    overflow-hidden
    hover:-translate-y-1
  "
                      >
                        <div className="relative p-6 flex flex-col h-full z-10">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-slate-700 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                              {agent.name.charAt(0)}
                            </div>
                            <Badge
                              variant={
                                agent.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className={cn(
                                "uppercase text-[10px] tracking-widest font-bold px-2 py-0.5 border shadow-none",
                                agent.status === "active"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-slate-50 text-slate-400 border-slate-100",
                              )}
                            >
                              {agent.status}
                            </Badge>
                          </div>

                          {/* Content */}
                          <div className="mb-6 flex-1 space-y-3">
                            <h3 className="font-bold text-xl text-slate-900 group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                              {agent.name}
                            </h3>

                            <div className="space-y-2">
                              <div className="flex items-center text-xs font-bold text-slate-500">
                                <MapPin className="h-4 w-4 mr-2 text-slate-300" />
                                {agent.location}
                              </div>
                              <div className="flex items-center text-xs font-bold text-slate-500">
                                <Store className="h-4 w-4 mr-2 text-slate-300" />
                                {agent.merchantsCount} Active Merchants
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-sm font-bold text-primary transition-colors duration-300">
                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                              View Storefront
                            </span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-slate-200"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <span className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-slate-200"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-5 w-5" />
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
