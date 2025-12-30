"use client";

import Link from "next/link";
import {
  ArrowRight,
  QrCode,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  Megaphone,
  Gift,
  Sparkles,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const tHeroSection = useTranslations("Homepage.heroSection");
  const tFeatures = useTranslations("Homepage.fetaures");
  const tHowItWorks = useTranslations("Homepage.howitworks");
  const tFooter = useTranslations("Homepage.footer");
  const locale = useLocale();
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState("brewlab");

  const sponsoredAds = [
    {
      title: "Boosted Reach",
      description: "Premium placement to get your QR campaigns noticed first.",
      cta: "Book a slot",
      accent: "from $79/week",
      tag: "Sponsored",
    },
    {
      title: "Seasonal Spotlight",
      description:
        "Highlight your holiday or event deals with vibrant banners.",
      cta: "Reserve now",
      accent: "Limited spots",
      tag: "Hot",
    },
    {
      title: "Local Favorites",
      description:
        "Show up in neighborhoods that matter with geo-targeted ads.",
      cta: "Plan campaign",
      accent: "Hyper-local",
      tag: "New",
    },
  ];

  const merchants = [
    {
      id: "brewlab",
      name: "BrewLab Coffee",
      category: "Specialty Cafe",
      highlight: "Loyalty perks on every 5th scan.",
      tone: "Warm & cozy rewards for coffee loyalists.",
      coupons: [
        {
          code: "BREWQR20",
          title: "Morning essentials • 20% off",
          description: "Apply on any handcrafted drink before 11 AM.",
          badge: "Best for regulars",
          expires: "Ends soon",
        },
        {
          code: "BREWFREE",
          title: "Free pastry with 2 coffees",
          description: "Scan in-store and apply at checkout.",
          badge: "In-store exclusive",
          expires: "Weekend only",
        },
      ],
    },
    {
      id: "urbanfit",
      name: "UrbanFit Studio",
      category: "Fitness & Wellness",
      highlight: "Scan-based passes that convert trial users.",
      tone: "Perfect for fitness creators and studios.",
      coupons: [
        {
          code: "FITPASS7",
          title: "7‑day unlimited pass",
          description: "Access all classes with a single QR.",
          badge: "Top converting",
          expires: "Limited slots",
        },
        {
          code: "FITDUO30",
          title: "Bring a friend • 30% off",
          description: "Applied when two passes are scanned together.",
          badge: "Partner offer",
          expires: "Valid this month",
        },
      ],
    },
    {
      id: "streetbites",
      name: "StreetBites",
      category: "Quick Service Restaurant",
      highlight: "Serial codes that keep queues moving.",
      tone: "Designed for high-volume counters.",
      coupons: [
        {
          code: "BITES15",
          title: "Combo deals • 15% off",
          description: "Works on QR-based combo menus.",
          badge: "Rush hour",
          expires: "5–7 PM daily",
        },
        {
          code: "QRQUEUE",
          title: "Skip-the-line upgrade",
          description: "Scan to unlock priority pickup.",
          badge: "VIP lane",
          expires: "Selected outlets",
        },
      ],
    },
    {
      id: "glowbar",
      name: "Glow Bar Beauty",
      category: "Salon & Spa",
      highlight: "Memberships driven by QR-linked referrals.",
      tone: "For beauty chains going phygital.",
      coupons: [
        {
          code: "GLOWFIRST",
          title: "First visit • 30% off",
          description: "Redeemable on any service above $40.",
          badge: "New guests",
          expires: "This quarter",
        },
        {
          code: "GLOWFRIENDS",
          title: "Refer & relax",
          description: "Both get 15% off on the next booking.",
          badge: "Referral booster",
          expires: "No hard expiry",
        },
      ],
    },
    {
      id: "cineplex",
      name: "CinePlex QR",
      category: "Cinema & Events",
      highlight: "Serial coupons linked to specific shows.",
      tone: "Ideal for premieres and live events.",
      coupons: [
        {
          code: "SEATUP",
          title: "Seat upgrade on check‑in",
          description: "Scan on arrival to unlock better seats.",
          badge: "Experience",
          expires: "While seats last",
        },
        {
          code: "SNACKQR",
          title: "Snacks combo • 25% off",
          description: "Attach to QR tickets and redeem at the counter.",
          badge: "Upsell",
          expires: "All shows today",
        },
      ],
    },
    {
      id: "freshmart",
      name: "FreshMart Local",
      category: "Grocery & Retail",
      highlight: "Shelf QR tags that rotate seasonal offers.",
      tone: "Perfect for multi-location retail teams.",
      coupons: [
        {
          code: "FRESH20",
          title: "Fresh basket • 20% off",
          description: "Applies on curated fresh produce bundles.",
          badge: "Seasonal",
          expires: "This week only",
        },
        {
          code: "SCANBULK",
          title: "Bulk & save",
          description: "Scan in aisle to unlock volume discounts.",
          badge: "Inventory push",
          expires: "Selected SKUs",
        },
      ],
    },
    {
      id: "stayhub",
      name: "StayHub Stays",
      category: "Hotels & Stays",
      highlight: "Room QR that unlock on‑property perks.",
      tone: "For hosts who want every scan to delight.",
      coupons: [
        {
          code: "LATEOUT",
          title: "Late checkout unlock",
          description: "Guests scan room QR for a free 2‑hour extension.",
          badge: "Guest delight",
          expires: "Subject to availability",
        },
        {
          code: "QRBREAKFAST",
          title: "Breakfast for 2",
          description: "Attach to booking confirmations via QR.",
          badge: "Add‑on",
          expires: "Weekends only",
        },
      ],
    },
  ];

  const visibleMerchants = merchants.slice(0, 6);
  const showSeeAll = merchants.length > visibleMerchants.length;
  const activeMerchant =
    merchants.find((m) => m.id === selectedMerchantId) ?? merchants[0];

  useEffect(() => {
    if (!copiedCode) return;
    const timer = setTimeout(() => setCopiedCode(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedCode]);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
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
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Sign In
          </Link>
          <Link href={`/${locale}/login`}>
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 lg:px-10 py-20 lg:py-32 flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 hover:bg-primary/20">
            {tHeroSection("para")}
          </div>
          <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight">
            {tHeroSection("1")}{" "}
            <span className="text-primary">{tHeroSection("2")}</span>
            {tHeroSection("3")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {tHeroSection("description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href={`/${locale}/login`}>
              <Button size="lg" className="h-12 px-8 text-lg">
                {tHeroSection("freeTrial")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
              {tHeroSection("viewDemo")}
            </Button>
          </div>
        </section>


        {/* STRATEGY 2: Full-Width Banner Ad */}
        <section className="px-6 lg:px-10 py-10 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-indigo-900 shadow-xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-6">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 text-xs font-semibold text-indigo-100 uppercase tracking-widest mb-3">
                  <Megaphone className="w-3 h-3" /> Sponsored
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                  Scale Your Cloud Infrastructure
                </h2>
                <p className="text-indigo-100 max-w-xl text-lg">
                  Get $200 in free credits when you sign up for CloudScale this month.
                </p>
              </div>
              <button className="whitespace-nowrap rounded-lg bg-white px-8 py-4 text-sm font-bold uppercase tracking-wide text-indigo-900 shadow-lg transition hover:bg-indigo-50 hover:scale-105 active:scale-95">
                Claim Offer
              </button>
            </div>
          </div>
        </section>

        {/* STRATEGY 2: Featured Partners Grid (News/Magazine Style) */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="px-6 lg:px-10 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Featured Partners
              </h3>
              <Link href="#" className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
                Advertise with us
              </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  id: 1,
                  image: "bg-emerald-100",
                  brand: "FinTech Sol",
                  title: "Smart Banking for Startups",
                  desc: "Zero-fee business accounts designed for rapid growth.",
                  cta: "Open Account",
                  icon: "💳"
                },
                {
                  id: 2,
                  image: "bg-orange-100",
                  brand: "WorkFlow",
                  title: "Automate Your daily Tasks",
                  desc: "Save 20+ hours a week with AI-driven automation.",
                  cta: "Try Free",
                  icon: "⚡"
                },
                {
                  id: 3,
                  image: "bg-blue-100",
                  brand: "CyberGuard",
                  title: "Enterprise Security Audit",
                  desc: "Identify vulnerabilities before they become threats.",
                  cta: "Get Report",
                  icon: "🛡️"
                },
                {
                  id: 4,
                  image: "bg-purple-100",
                  brand: "DevHire",
                  title: "Top 1% Tech Talent",
                  desc: "Pre-vetted senior developers ready to join your team.",
                  cta: "View Profiles",
                  icon: "👨‍💻"
                }
              ].map((ad) => (
                <div key={ad.id} className="group cursor-pointer flex flex-col gap-4">
                  <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl ${ad.image} flex items-center justify-center text-4xl shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.02]`}>
                    <span className="text-6xl opacity-50 transition-transform group-hover:scale-110 duration-500">{ad.icon}</span>
                    <div className="absolute top-3 right-3 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shadow-sm backdrop-blur-sm">
                      Ad
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{ad.brand}</span>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                      {ad.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {ad.desc}
                    </p>
                    <span className="mt-2 inline-flex items-center text-sm font-semibold text-primary group-hover:underline underline-offset-4">
                      {ad.cta} <ArrowRight className="ml-1 w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Native Inline Ad (Visible between sections) */}
        <div className="py-6 bg-slate-50">
          <div className="px-6 lg:px-10 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="shrink-0 h-16 w-16 bg-slate-900 rounded-lg flex items-center justify-center text-white text-2xl">
                🚀
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h4 className="font-bold text-slate-900">SaaS Growth Weekly</h4>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-500">Ad</span>
                </div>
                <p className="text-sm text-slate-600">Join 50,000+ founders getting growth tips every Monday.</p>
              </div>
              <button className="shrink-0 rounded-md bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800">
                Subscribe Free
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section className="bg-slate-50 py-20 lg:py-32">
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
              <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition">
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {tFeatures("card1Heading")}
                </h3>
                <p className="text-muted-foreground">
                  {tFeatures("card1Description")}
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition">
                <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {tFeatures("card2Heading")}
                </h3>
                <p className="text-muted-foreground">
                  {tFeatures("card2Description")}
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition">
                <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {tFeatures("card3Heading")}
                </h3>
                <p className="text-muted-foreground">
                  {tFeatures("card3Description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 lg:py-32">
          <div className="px-6 lg:px-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {tHowItWorks("h1")}
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {tHowItWorks("heading1")}
                    </h3>
                    <p className="text-muted-foreground">
                      {tHowItWorks("descp1")}{" "}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {tHowItWorks("heading2")}{" "}
                    </h3>
                    <p className="text-muted-foreground">
                      {tHowItWorks("descp2")}{" "}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{tHowItWorks("h3")} </h3>
                    <p className="text-muted-foreground">
                      {tHowItWorks("descp3")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-slate-100 rounded-2xl aspect-video w-full flex items-center justify-center text-slate-400">
                <QrCode className="h-32 w-32 opacity-20" />
              </div>
            </div>
          </div>
        </section>

        {/* Merchants, coupons & paid ads */}
        <section className="relative overflow-hidden bg-linear-to-b from-slate-950 via-slate-900 to-black text-white py-20 lg:py-32">
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,#38bdf880,transparent_40%),radial-gradient(circle_at_bottom,#a855f780,transparent_45%)]" />
          <div className="px-6 lg:px-10 max-w-7xl mx-auto relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Live merchant drops
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Tap a merchant. Copy a coupon. Run it with QR.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
                  Preview how multi-merchant coupon walls look inside QR Rev.
                  Each brand carries its own coupon stack, ready to be scanned,
                  copied, and redeemed.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold shadow-lg">
                  <Megaphone className="h-4 w-4" />
                  Paid placements available
                </div>
                {showSeeAll && (
                  <Link href={`/${locale}/merchants`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/40 text-white hover:bg-white hover:text-slate-900"
                    >
                      View more merchants
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:items-stretch">
              {/* Merchant list */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/60">
                    <div className="h-px w-8 bg-white/30" />
                    Merchants
                  </div>
                  <span className="rounded-full bg-emerald-400/10 border border-emerald-300/40 px-2.5 py-1 text-[10px] font-semibold text-emerald-100">
                    {merchants.length} live examples
                  </span>
                </div>
                <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1 pb-1">
                  {visibleMerchants.map((merchant) => {
                    const isActive = merchant.id === activeMerchant.id;
                    return (
                      <button
                        key={merchant.id}
                        type="button"
                        onClick={() => setSelectedMerchantId(merchant.id)}
                        className={`w-full text-left rounded-xl border px-3.5 py-3 transition flex flex-col gap-1.5 ${isActive
                          ? "border-emerald-400/70 bg-emerald-400/10 shadow-[0_0_0_1px_rgba(16,185,129,0.5)]"
                          : "border-white/5 bg-black/20 hover:border-white/30 hover:bg-white/5"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold uppercase tracking-wide">
                              {merchant.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 3)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {merchant.name}
                              </p>
                              <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                                {merchant.category}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                            {merchant.coupons.length} coupons
                          </span>
                        </div>
                        <p className="text-xs text-white/70 line-clamp-2">
                          {merchant.highlight}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active merchant coupons + ads */}
              <div className="space-y-5 ">
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 sm:p-7 shadow-[0_30px_100px_-60px_rgba(99,102,241,0.7)] h-[700px] flex justify-center items-center flex-col">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                        Coupon wall preview
                      </p>
                      <h3 className="mt-1 text-xl sm:text-2xl font-bold">
                        {activeMerchant.name}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                        {activeMerchant.category}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-100 flex items-center gap-2">
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Optimized for scan‑to‑redeem flows</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    {activeMerchant.tone}
                  </p>

                  <div className="mt-6 space-y-4">
                    {activeMerchant.coupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/60">
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-sky-200">
                              {coupon.badge}
                            </span>
                            <span>{coupon.expires}</span>
                          </div>
                          <div className="text-sm sm:text-base font-semibold flex items-center gap-2">
                            <Gift className="h-4 w-4 text-amber-300" />
                            {coupon.title}
                          </div>
                          <p className="text-xs sm:text-sm text-white/65">
                            {coupon.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:items-end">
                          <div className="flex items-center gap-2 rounded-full bg-white text-slate-900 px-3 py-1 text-xs sm:text-sm font-semibold shadow-md">
                            <QrCode className="h-4 w-4" />
                            {coupon.code}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white hover:text-slate-900"
                            onClick={() => handleCopy(coupon.code)}
                          >
                            {copiedCode === coupon.code ? (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy code
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline paid ads strip */}
                {/* <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/60">
                      <div className="h-px w-6 bg-white/30" />
                      Sponsored placements
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-white/70 hover:bg-white/10"
                    >
                      <Megaphone className="mr-1.5 h-3.5 w-3.5" />
                      Promote your brand here
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {sponsoredAds.map((ad) => (
                      <div
                        key={ad.title}
                        className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs sm:text-sm flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">
                            {ad.tag}
                          </span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-amber-200">
                            {ad.accent}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="font-semibold text-xs sm:text-sm">
                            {ad.title}
                          </p>
                          <p className="mt-1 text-[11px] text-white/70">
                            {ad.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-3 py-1 text-[11px] font-medium text-white hover:bg-white hover:text-slate-900 transition"
                        >
                          {ad.cta}
                        </button>
                      </div>
                    ))}
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center">
              <QrCode className="h-4 w-4" />
            </div>
            QR Rev
          </div>
          <div className="text-sm text-muted-foreground">{tFooter("text")}</div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="#" className="hover:underline">
              {tFooter("Privacy")}
            </Link>
            <Link href="#" className="hover:underline">
              {tFooter("Terms")}
            </Link>
            <Link href="#" className="hover:underline">
              {tFooter("Contact")}
            </Link>
          </div>
        </div>
      </footer>
    </div >
  );
}
