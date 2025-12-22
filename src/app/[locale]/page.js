"use client";

import Link from "next/link";
import {
  ArrowRight,
  QrCode,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/common/language-switcher";

export default function LandingPage() {
  const tHeroSection = useTranslations("Homepage.heroSection");
  const tFeatures = useTranslations("Homepage.fetaures");
  const tHowItWorks = useTranslations("Homepage.howitworks");
  const tFooter = useTranslations("Homepage.footer");

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
            href="/en/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Sign In
          </Link>
          <Link href="/en/login">
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
            <Link href="/en/login">
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

        {/* Pricing */}
        <section className="bg-slate-900 text-white py-20 lg:py-32">
          <div className="px-6 lg:px-10 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-slate-400 text-lg">
                Choose the plan that fits your business size.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Standard */}
              <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <h3 className="text-xl font-bold mb-2">Temporary Plan</h3>
                <div className="text-3xl font-bold mb-6">
                  $29
                  <span className="text-lg text-slate-400 font-normal">
                    /month
                  </span>
                </div>
                <ul className="space-y-3 mb-8 text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" /> 500 Coupons per
                    Batch
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" /> Basic Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" /> Standard
                    Support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" /> 1 Location
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
              </div>

              {/* Annual */}
              <div className="bg-primary rounded-2xl p-8 border-2 border-primary relative transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-white text-primary text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  BEST VALUE
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-foreground">
                  Annual Plan
                </h3>
                <div className="text-3xl font-bold mb-6 text-primary-foreground">
                  $290
                  <span className="text-lg text-primary-foreground/70 font-normal">
                    /year
                  </span>
                </div>
                <ul className="space-y-3 mb-8 text-primary-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> 10,000 Coupons per Batch
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Full Customer Data Access
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Priority Support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Multi-Location Support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Advanced Automation
                  </li>
                </ul>
                <Button className="w-full bg-white text-primary hover:bg-white/90">
                  Choose Annual
                </Button>
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
    </div>
  );
}
