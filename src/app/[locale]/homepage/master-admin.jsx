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

// --- Main Page Component ---
export default function MasterAdminLandingPage() {
  const tHeroSection = useTranslations("Homepage.heroSection");
  const tFeatures = useTranslations("Homepage.fetaures");
  const tFooter = useTranslations("Homepage.footer");
  const locale = useLocale();
  const router = useRouter();

  // Mode: 'directory' or 'agent-details'
  // const [viewMode, setViewMode] = useState("directory");
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Data State
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [countries, setCountries] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/coupons/super-admin-feed");
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
    currentPage * ITEMS_PER_PAGE
  );

  const handleAgentClick = (agent) => {
    router.push(`/${locale}/homepage/agent?agentId=${agent.id}`);
  };

  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900 bg-slate-50/50">
      {/* -- Navigation -- */}
      <header className="px-6 lg:px-10 py-5 flex items-center justify-between border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl cursor-pointer">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <QrCode className="h-5 w-5" />
          </div>
          QR Rev{" "}
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
        <section className="px-6 lg:px-10 py-20 lg:py-28 flex flex-col items-center text-center max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
          <Badge
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 text-sm"
          >
            Global Network
          </Badge>
          <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Find Your Local <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600 animate-gradient">
              Deal Marketplace
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with certified agents worldwide to access exclusive local
            offers. Discover premium merchants and unlock verified coupons in
            your region.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="#agent-directory">
              <Button
                size="lg"
                className="h-14 px-8 text-lg shadow-lg shadow-primary/20 rounded-xl"
              >
                Browse Directory <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* -- Sponsored Ad Slot -- */}

        {/* -- Main Content Area (Agent Directory or Detail) -- */}
        <section
          className="bg-slate-50 py-20 border-y border-slate-200"
          id="agent-directory"
        >
          <div className="px-6 lg:px-10 max-w-7xl mx-auto">
            <div className="space-y-12 animate-in fade-in duration-500">
              {/* Header for Directory */}
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/20">
                  <Globe className="w-3.5 h-3.5" /> Global Operations
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 pt-2">
                  Agent Directory
                </h2>
                <p className="text-slate-500 text-lg">
                  Discover and manage your network of agents across the globe.
                </p>
              </div>

              {/* Filters & Controls */}
              <div className="bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0)] border border-slate-200 ring-4 ring-slate-100/50">
                <TableToolbar
                  placeholder="Search agents by name or email..."
                  onSearchChange={(val) => {
                    setSearchQuery(val);
                    setCurrentPage(1);
                  }}
                  rightSlot={
                    <Select
                      value={selectedCountry}
                      onValueChange={(val) => {
                        setSelectedCountry(val);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[220px] h-10 border-input focus:ring-0 focus:border-ring rounded-md text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="h-4 w-4" />
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
                  }
                  className="shadow-none border-0 p-0"
                />
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
                        className="group bg-white rounded-3xl p-1 border border-transparent shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col relative overflow-hidden ring-1 ring-slate-100 hover:ring-primary/20 hover:scale-[1.02]"
                      >
                        <div className="absolute inset-0 bg-linear-to-br from-white via-white to-slate-50 opacity-100 transition-all group-hover:via-white/50" />

                        <div className="relative p-5 flex flex-col h-full z-10">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary/5 to-purple-500/5 border border-primary/10 flex items-center justify-center text-2xl font-black text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
                              {agent.name.charAt(0)}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                variant={
                                  agent.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={cn(
                                  "uppercase text-[10px] tracking-widest font-bold px-2 py-0.5",
                                  agent.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-none border border-emerald-500/20"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                )}
                              >
                                {agent.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="mb-8 flex-1 space-y-4">
                            <div>
                              <h3 className="font-bold text-xl text-slate-900 mb-1 group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                                {agent.name}
                              </h3>
                              <div className="flex items-center text-xs font-medium text-slate-500 mb-2">
                                <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                                {agent.location}
                              </div>
                              <div className="flex items-center text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-md w-fit border border-slate-100">
                                <Store className="h-3.5 w-3.5 mr-2 text-purple-600" />
                                {agent.merchantsCount} Merchants
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-auto space-y-3">
                            <Button className="w-full bg-slate-900 hover:bg-primary transition-all duration-300 text-white rounded-xl h-11 font-bold shadow-lg shadow-slate-200 group-hover:shadow-primary/20 group-hover:-translate-y-0.5 cursor-pointer">
                              Explore Exclusive Deals{" "}
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed px-2">
                              Find Merchants <span className="mx-1">•</span> Get
                              Coupons <span className="mx-1">•</span> Earn
                              Rewards
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-8">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-900">No agents found</h3>
                  <p className="text-slate-500">Try adjusting your filters.</p>
                </div>
              )}
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
    </div>
  );
}
