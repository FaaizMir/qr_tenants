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
  CheckCircle2,
  Search,
  MapPin,
  Store,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function LandingPage() {
  const tHeroSection = useTranslations("Homepage.heroSection");
  const tFeatures = useTranslations("Homepage.fetaures");
  const tHowItWorks = useTranslations("Homepage.howitworks");
  const tFooter = useTranslations("Homepage.footer");
  const locale = useLocale();

  // -- Marketplace State --
  const [selectedMerchantId, setSelectedMerchantId] = useState("brewlab");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [halalOnly, setHalalOnly] = useState(false);

  // -- Coupon Redemption Flow State --
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    dob: "",
  });
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);

  // -- Mock Data --
  const merchants = [
    {
      id: "brewlab",
      name: "BrewLab Coffee",
      category: "Restaurant",
      region: "downtown",
      highlight: "Loyalty perks on every 5th scan.",
      tone: "Warm & cozy rewards for coffee loyalists.",
      coupons: [
        {
          code: "BREWQR20",
          title: "Morning essentials • 20% off",
          description: "Apply on any handcrafted drink before 11 AM.",
          badge: "Best for regulars",
          expires: "Ends soon",
          isHalal: true,
        },
        {
          code: "BREWFREE",
          title: "Free pastry with 2 coffees",
          description: "Scan in-store and apply at checkout.",
          badge: "In-store exclusive",
          expires: "Weekend only",
          isHalal: true,
        },
      ],
    },
    {
      id: "urbanfit",
      name: "UrbanFit Studio",
      category: "Services",
      region: "north",
      highlight: "Scan-based passes that convert trial users.",
      tone: "Perfect for fitness creators and studios.",
      coupons: [
        {
          code: "FITPASS7",
          title: "7‑day unlimited pass",
          description: "Access all classes with a single QR.",
          badge: "Top converting",
          expires: "Limited slots",
          isHalal: false,
        },
      ],
    },
    {
      id: "glowbar",
      name: "Glow Bar Beauty",
      category: "Beauty",
      region: "south",
      highlight: "Memberships driven by QR-linked referrals.",
      tone: "For beauty chains going phygital.",
      coupons: [
        {
          code: "GLOWFIRST",
          title: "First visit • 30% off",
          description: "Redeemable on any service above $40.",
          badge: "New guests",
          expires: "This quarter",
          isHalal: false,
        },
      ],
    },
    {
      id: "freshmart",
      name: "FreshMart Local",
      category: "Retail",
      region: "west",
      highlight: "Shelf QR tags that rotate seasonal offers.",
      tone: "Perfect for multi-location retail teams.",
      coupons: [
        {
          code: "FRESH20",
          title: "Fresh basket • 20% off",
          description: "Applies on curated fresh produce bundles.",
          badge: "Seasonal",
          expires: "This week only",
          isHalal: true,
        },
      ],
    },
  ];

  // -- Filtering Logic --
  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.highlight.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion =
      selectedRegion === "all" || m.region === selectedRegion;
    const matchesCategory =
      selectedCategory === "all" || m.category === selectedCategory;

    // Check if at least one coupon has the Halal tag if filter is active
    const matchesHalal = !halalOnly || m.coupons.some((c) => c.isHalal);

    return matchesSearch && matchesRegion && matchesCategory && matchesHalal;
  });

  const activeMerchant =
    merchants.find((m) => m.id === selectedMerchantId) ?? merchants[0];

  // -- Handlers --
  const handleGetCoupon = (coupon, merchantName) => {
    setSelectedCoupon({ ...coupon, merchantName });
    setRedemptionSuccess(false);
    setCustomerForm({ name: "", phone: "", dob: "" });
    setModalOpen(true);
  };

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    setIsRedeeming(true);

    // Simulate Backend API Call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsRedeeming(false);
    setRedemptionSuccess(true);
    toast.success("Coupon sent via WhatsApp!");
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
            {tHeroSection("para")}
          </Badge>
          <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            {tHeroSection("1")}{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600 animate-gradient">
              {tHeroSection("2")}
            </span>
            {tHeroSection("3")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {tHeroSection("description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href={`/${locale}/login`}>
              <Button
                size="lg"
                className="h-14 px-8 text-lg shadow-lg shadow-primary/20"
              >
                {tHeroSection("freeTrial")}{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* -- Sponsored Ad Slot (Homepage Featured) -- */}
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
          <div className="px-6 lg:px-10 max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold">Explore Local Deals</h2>
              <p className="text-muted-foreground text-lg">
                Discover coupons from top merchants in your area.
              </p>
            </div>

            {/* -- Search & Filters -- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search businesses or offers..."
                  className="pl-10 h-11 text-base bg-slate-50 border-0 focus-visible:ring-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
                <select
                  className="h-11 px-4 rounded-md border bg-slate-50 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Restaurant">Restaurants</option>
                  <option value="Retail">Retail</option>
                  <option value="Beauty">Beauty & Spa</option>
                  <option value="Services">Services</option>
                </select>
                <select
                  className="h-11 px-4 rounded-md border bg-slate-50 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="all">All Regions</option>
                  <option value="downtown">Downtown</option>
                  <option value="north">North District</option>
                  <option value="south">South Bay</option>
                  <option value="west">West Side</option>
                </select>

                <div className="flex items-center space-x-2 bg-white px-3 border rounded-md h-11 shrink-0">
                  <Checkbox
                    id="halal"
                    checked={halalOnly}
                    onCheckedChange={setHalalOnly}
                  />
                  <Label
                    htmlFor="halal"
                    className="text-sm cursor-pointer font-medium text-emerald-800"
                  >
                    Halal Only
                  </Label>
                </div>
              </div>
            </div>

            {/* -- Results Grid -- */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => (
                  <div
                    key={merchant.id}
                    className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-[400px]"
                  >
                    {/* Decorative Gradient Cover */}
                    <div
                      className={`h-24 shrink-0 w-full relative overflow-hidden ${
                        merchant.category === "Restaurant"
                          ? "bg-linear-to-br from-orange-400 to-rose-500"
                          : merchant.category === "Beauty"
                          ? "bg-linear-to-br from-pink-400 to-purple-500"
                          : merchant.category === "Retail"
                          ? "bg-linear-to-br from-blue-400 to-cyan-500"
                          : "bg-linear-to-br from-emerald-400 to-teal-500"
                      }`}
                    >
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                      <div className="absolute top-3 left-4 flex gap-2">
                        <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur shadow-sm font-bold uppercase tracking-wider text-[10px] h-5">
                          {merchant.category}
                        </Badge>
                        {merchant.coupons.some((c) => c.isHalal) && (
                          <Badge className="bg-emerald-500 text-white border-0 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 h-5">
                            <CheckCircle2 className="w-3 h-3" /> Halal
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col relative overflow-hidden">
                      {/* Floating Icon/Logo */}
                      <div className="absolute top-1 right-5 h-12 w-12 bg-white dark:bg-zinc-900 rounded-xl shadow-lg flex items-center justify-center border-[3px] border-white dark:border-zinc-900 z-10">
                        <Store className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      </div>

                      <div className="mb-2 pr-12">
                        <h3 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                          {merchant.name}
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5 font-medium">
                          <MapPin className="h-3 w-3 mr-1 text-primary" />
                          <span className="capitalize">{merchant.region}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed border-l-2 border-primary/20 pl-3 italic line-clamp-2 min-h-[2.5em]">
                        {merchant.highlight}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        <Gift className="w-3 h-3" /> Available Offers
                      </div>

                      {/* Scrollable Coupon Area */}
                      <div className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-1 min-h-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {merchant.coupons.map((coupon) => (
                          <div
                            key={coupon.code}
                            className="group/coupon relative overflow-hidden bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-primary/50 transition-colors p-3 flex flex-col gap-2 shrink-0"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight truncate">
                                  {coupon.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                  {coupon.description}
                                </p>
                              </div>
                              {coupon.badge && (
                                <span className="shrink-0 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase rounded-full">
                                  {coupon.badge}
                                </span>
                              )}
                            </div>

                            <div className="pt-2 border-t border-dashed border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                              <div className="text-[10px] font-medium text-slate-400 hidden sm:block">
                                WhatsApp Only
                              </div>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleGetCoupon(coupon, merchant.name)
                                }
                                className="h-7 px-3 bg-slate-900 text-white hover:bg-primary hover:text-white shadow-none transition-all rounded-md text-[10px] font-bold ml-auto"
                              >
                                Get{" "}
                                <ArrowRight className="ml-1 w-2.5 h-2.5 group-hover/coupon:translate-x-0.5 transition-transform" />
                              </Button>
                            </div>

                            {/* Decorative Circles */}
                            <div className="absolute -left-1.5 top-1/2 -mt-1 h-3 w-3 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700" />
                            <div className="absolute -right-1.5 top-1/2 -mt-1 h-3 w-3 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">
                    No merchants found matching your filters.
                  </p>
                </div>
              )}
            </div>

            {/* -- Inline Ad (Category Placement) -- */}
            <div className="rounded-xl border border-dashed border-slate-300 p-8 flex flex-col md:flex-row items-center gap-8 justify-between bg-slate-50/50">
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
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          {!redemptionSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Get Coupon</DialogTitle>
                <DialogDescription>
                  Receive your <b>{selectedCoupon?.title}</b> voucher from{" "}
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
                  Your coupon for <b>{selectedCoupon?.title}</b> has been sent
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
      </Dialog>
    </div>
  );
}
