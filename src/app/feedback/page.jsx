"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "@/components/ui/select";

export default function FeedbackPage() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const mid = search.get("mid");
  const hash = search.get("hash");

  const [form, setForm] = useState({
    merchantId: mid ? Number(mid) : "",
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    address: "",
    date_of_birth: "",
    gender: "",
    rating: 5,
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showSocialSelect, setShowSocialSelect] = useState(false);

  // Mock Merchant Configuration (In real app, fetch this from API based on mid)
  const mockMerchantConfig = {
    enableGoogle: true,
    enableFacebook: true,
    enableInstagram: false,
    enableRed: true, // XiaoHongShu
    googleReviewLink: "https://g.page/example/review",
    facebookReviewLink: "https://facebook.com/example/reviews",
    instagramReviewLink: "https://instagram.com/example",
    redReviewLink: "https://xiaohongshu.com/user/example",
  };

  const formatDateToDDMMYYYY = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSocialRedirect = (platform) => {
    let url = "";
    switch (platform) {
      case "google": url = mockMerchantConfig.googleReviewLink; break;
      case "facebook": url = mockMerchantConfig.facebookReviewLink; break;
      case "instagram": url = mockMerchantConfig.instagramReviewLink; break;
      case "red": url = mockMerchantConfig.redReviewLink; break;
      default: break;
    }
    if (url) window.open(url, "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.merchantId) {
      setError("Missing merchant id (mid)");
      return;
    }

    // prepare payload
    const payload = {
      merchantId: Number(form.merchantId),
      email: form.email,
      password: form.password,
      name: form.name,
      phoneNumber: form.phoneNumber,
      address: form.address,
      date_of_birth: form.date_of_birth ? formatDateToDDMMYYYY(form.date_of_birth) : "",
      gender: form.gender,
      rating: Number(form.rating) || 0,
      comment: form.comment,
    };

    try {
      setLoading(true);
      const resp = await axiosInstance.post(`/feedbacks`, payload);
      setSuccess("Feedback submitted successfully.");

      // Check if any social platforms are enabled to show the selector
      const hasSocial = mockMerchantConfig.enableGoogle || mockMerchantConfig.enableFacebook || mockMerchantConfig.enableInstagram || mockMerchantConfig.enableRed;

      if (hasSocial) {
        setShowSocialSelect(true);
      } else {
        // Default redirect behavior
        setTimeout(() => {
          let locale = null;
          try {
            if (typeof window !== "undefined") {
              const parts = (pathname || window.location.pathname).split("/").filter(Boolean);
              if (parts.length && parts[0].length <= 5) locale = parts[0];
            }
          } catch (e) {
            locale = null;
          }
          const target = locale ? `/${locale}/agent/dashboard` : "/agent/dashboard";
          router.push(target);
        }, 1500);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to submit feedback.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (showSocialSelect) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl text-green-600">Thank you!</CardTitle>
            <p className="text-muted-foreground">Your feedback has been received.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Share your experience</h3>
              <p className="text-sm text-muted-foreground mb-4">Please select a platform to leave a public review:</p>

              <div className="grid grid-cols-1 gap-3">
                {mockMerchantConfig.enableGoogle && (
                  <Button variant="outline" className="w-full h-12 justify-start gap-3 hover:bg-slate-50" onClick={() => handleSocialRedirect('google')}>
                    <span className="text-xl">🇬</span> Google Reviews
                  </Button>
                )}
                {mockMerchantConfig.enableFacebook && (
                  <Button variant="outline" className="w-full h-12 justify-start gap-3 hover:bg-blue-50" onClick={() => handleSocialRedirect('facebook')}>
                    <span className="text-xl">🇫</span> Facebook Page
                  </Button>
                )}
                {mockMerchantConfig.enableInstagram && (
                  <Button variant="outline" className="w-full h-12 justify-start gap-3 hover:bg-pink-50" onClick={() => handleSocialRedirect('instagram')}>
                    <span className="text-xl">📸</span> Instagram
                  </Button>
                )}
                {mockMerchantConfig.enableRed && (
                  <Button variant="outline" className="w-full h-12 justify-start gap-3 hover:bg-red-50" onClick={() => handleSocialRedirect('red')}>
                    <span className="text-xl">📕</span> XiaoHongShu (RED)
                  </Button>
                )}
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Please leave your feedback for the merchant. Merchant id: <strong>{mid || "-"}</strong>{hash ? <span className="ml-2 text-xs text-muted-foreground">(ref: {hash.slice(0, 8)}...)</span> : null}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Merchant ID</label>
                <Input name="merchantId" value={form.merchantId} onChange={handleChange} disabled className="mt-1" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <Input name="email" value={form.email} onChange={handleChange} type="email" placeholder="you@example.com" className="mt-1" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="9876543210" className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Password</label>
                <Input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password@123" className="mt-1" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Date of birth</label>
                <Input name="date_of_birth" value={form.date_of_birth} onChange={handleChange} type="date" className="mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Address</label>
              <Input name="address" value={form.address} onChange={handleChange} placeholder="456 Customer St" className="mt-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Gender</label>
                <Select name="gender" value={form.gender} onValueChange={(v) => setForm(s => ({ ...s, gender: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Rating</label>
                <Select name="rating" value={String(form.rating)} onValueChange={(v) => setForm(s => ({ ...s, rating: Number(v) }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Reference</label>
                <Input value={hash || ""} disabled className="mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Comment</label>
              <Textarea name="comment" value={form.comment} onChange={handleChange} rows={4} className="mt-1" />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Feedback"}</Button>
              {success && <div className="text-success">{success}</div>}
              {error && <div className="text-destructive">{error}</div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
