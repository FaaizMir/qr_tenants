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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
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

export default function LandingPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const tHeroSection = useTranslations("Homepage.heroSection");
  const tFeatures = useTranslations("Homepage.fetaures");
  const tFooter = useTranslations("Homepage.footer");
  const locale = useLocale();
  const router = useRouter();

  // -- Marketplace State --
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [cities, setCities] = useState([]);

  // -- Selection State --
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);

  // -- Coupon Redemption Flow State --
  // const [modalOpen, setModalOpen] = useState(false);
  // const [selectedCoupon, setSelectedCoupon] = useState(null);
  // const [customerForm, setCustomerForm] = useState({
  //   name: "",
  //   phone: "",
  //   dob: "",
  // });
  // const [isRedeeming, setIsRedeeming] = useState(false);
  // const [redemptionSuccess, setRedemptionSuccess] = useState(false);

  // -- Fetch Data --
  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          "https://qr-review.mustservices.io/backend/api/v1/coupons/public-feed"
        );

        // The API returns { data: { merchants: [ ... ] } }
        const responseData = response.data?.data;
        const merchantsData = responseData?.merchants || [];

        if (!Array.isArray(merchantsData)) {
          console.error(
            "API response structure unexpected. Expected data.merchants to be an array:",
            response.data
          );
          setMerchants([]);
          return;
        }

        // Transform merchants to match our UI needs
        const transformedMerchants = merchantsData.map((merchant) => ({
          id: merchant.id,
          name: merchant.business_name,
          category: merchant.business_type,
          address: merchant.address,
          city:
            merchant.city ||
            merchant.address?.split(",")?.pop()?.trim() ||
            "Unknown", // Fallback to parsing address if city is missing
          batches: merchant.batches.filter((batch) => batch.visibility == true),
          user: merchant.user,
        }));

        setMerchants(transformedMerchants);

        // Extract unique cities
        const uniqueCities = [
          ...new Set(transformedMerchants.map((m) => m.city)),
        ]
          .filter(Boolean)
          .sort();
        setCities(uniqueCities);

        // Don't auto-select any merchant - let user click to see batches
        setSelectedMerchantId(null);
      } catch (err) {
        console.error("Failed to fetch merchants:", err);
        setError("Failed to load merchants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []); // Fetch once on mount

  // -- Filtering Logic (Client-side for Search and Business Type) --
  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch = m.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || m.category === selectedCategory;
    const matchesRegion = selectedRegion === "all" || m.city === selectedRegion;

    return matchesSearch && matchesCategory && matchesRegion;
  });

  // Show only first 5 merchants by default when no filters are applied
  const displayedMerchants =
    searchQuery === "" && selectedCategory === "all" && selectedRegion === "all"
      ? filteredMerchants.slice(0, 5)
      : filteredMerchants;

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
    const batchId = batch.id;
    router.push(`/${locale}/customer/review?merchantId=${merchantId}&batchId=${batchId}`);
    sessionStorage.setItem(
      "couponReviewData",
      JSON.stringify({ merchant, batch })
    );
  };

  // const handleRedeemSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsRedeeming(true);

  // Simulate Backend API Call
  //   await new Promise((resolve) => setTimeout(resolve, 1500));

  //   setIsRedeeming(false);
  //   setRedemptionSuccess(true);
  //   toast.success("Coupon sent via WhatsApp!");
  // };

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

        {/* -- Sponsored Ad Slot -- */}
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
          <div className="px-6 lg:px-10 max-w-7xl mx-auto space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold">Explore Local Deals</h2>
              <p className="text-muted-foreground text-lg">
                Discover coupons from top merchants in your area.
              </p>
            </div>

            {/* -- Search & Filters -- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  className="pl-10 h-11 text-base bg-slate-50 border-0 focus-visible:ring-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-4 w-full lg:w-auto flex-col sm:flex-row">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-slate-50 border-0 focus:ring-1">
                    <SelectValue placeholder="Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Food and Beverage">
                      Food and Beverage
                    </SelectItem>
                    <SelectItem value="Retails">Retails</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Hospitality">Hospitality</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedRegion}
                  onValueChange={setSelectedRegion}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-slate-50 border-0 focus:ring-1">
                    <SelectValue placeholder="Region (City)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* -- Master-Detail Layout -- */}
            <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
              {/* Left Side: Merchant List */}
              <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto h-[600px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Loading merchants...
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4 text-red-500">
                    <p>{error}</p>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory(selectedCategory)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredMerchants.length > 0 ? (
                  displayedMerchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      onClick={() => setSelectedMerchantId(merchant.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${selectedMerchantId === merchant.id
                        ? "bg-white border-primary ring-1 ring-primary shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3
                            className={`font-bold text-lg ${selectedMerchantId === merchant.id
                              ? "text-primary"
                              : "text-slate-900"
                              }`}
                          >
                            {merchant.name}
                          </h3>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="capitalize">
                              {merchant.address}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-slate-100"
                        >
                          {merchant.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {merchant.address}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 ml-auto">
                          {merchant.batches?.length || 0} Batches
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground bg-white rounded-xl border">
                    <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No merchants found.</p>
                  </div>
                )}
              </div>

              {/* Right Side: Coupons Detail */}
              <div className="lg:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 h-[600px] overflow-y-auto relative">
                {activeMerchant ? (
                  <>
                    <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-slate-100 to-slate-50 z-0">
                      {/* Optional background or banner for merchant */}
                      <div
                        className={`w-full h-full opacity-10 ${activeMerchant.category === "Restaurant"
                          ? "bg-orange-500"
                          : activeMerchant.category === "Beauty"
                            ? "bg-pink-500"
                            : activeMerchant.category === "Retail"
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                          }`}
                      />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6 mt-4">
                        <div className="h-20 w-20 bg-white rounded-xl shadow-lg border-2 border-white flex items-center justify-center text-slate-700">
                          <Store className="h-10 w-10" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-slate-900">
                            {activeMerchant.name}
                          </h2>
                          <p className="text-slate-500 mt-1">
                            {activeMerchant.tone || activeMerchant.highlight}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <Gift className="w-4 h-4" /> Batch Collection
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {activeMerchant.batches &&
                          activeMerchant.batches.length > 0 ? (
                          activeMerchant.batches.map((batch) => (
                            <div
                              key={batch.id}
                              className="group relative overflow-hidden rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all"
                            >
                              {/* Render the batch HTML */}
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: batch.rendered_html,
                                }}
                                onClick={() =>
                                  handleGetCoupon(activeMerchant, batch)
                                }
                                className="cursor-pointer"
                              />

                              {/* Batch metadata overlay */}
                              <div className="p-4 bg-slate-50 border-t border-slate-200">
                                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                                  <span className="font-semibold">
                                    {batch.batch_name}
                                  </span>
                                  <Badge
                                    variant={
                                      batch.is_active ? "default" : "secondary"
                                    }
                                    className="text-[10px]"
                                  >
                                    {batch.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>
                                    {batch.issued_quantity}/
                                    {batch.total_quantity} issued
                                  </span>
                                  <span>
                                    {new Date(
                                      batch.start_date
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(
                                      batch.end_date
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleGetCoupon(activeMerchant, batch)}
                                  className="w-full mt-3 bg-slate-900 hover:bg-primary transition-colors"
                                >
                                  Get Coupon <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                            <p>No batches available for this merchant.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <Store className="h-16 w-16 opacity-10" />
                    <p className="text-lg font-medium">
                      Select a merchant to view offers
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* -- Inline Ad (Category Placement) -- */}
            <div className="rounded-xl border border-dashed border-slate-300 p-8 flex flex-col md:flex-row items-center gap-8 justify-between bg-slate-50/50 mt-12">
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
      {/* <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          {!redemptionSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Get Batch</DialogTitle>
                <DialogDescription>
                  Receive your <b>{selectedCoupon?.batch_name || selectedCoupon?.title}</b> batch from{" "}
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
                  Your batch for <b>{selectedCoupon?.batch_name || selectedCoupon?.title}</b> has been sent
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
      </Dialog> */}
    </div>
  );
}
