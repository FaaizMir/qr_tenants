import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Share2,
  Globe,
  Facebook,
  Instagram,
  MessageCircle,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

const DEFAULT_URLS = {
  google: "https://g.page/r/",
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  red: "https://www.xiaohongshu.com/",
};

export default function PlatformSettings() {
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const [state, setState] = useState({
    enableGoogle: false,
    enableFacebook: false,
    enableInstagram: false,
    enableRed: false,
    googleReviewLink: DEFAULT_URLS.google,
    facebookReviewLink: DEFAULT_URLS.facebook,
    instagramReviewLink: DEFAULT_URLS.instagram,
    redReviewLink: DEFAULT_URLS.red,
  });
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!merchantId) return;
    try {
      const res = await axiosInstance.get(
        `/merchant-settings/merchant/${merchantId}`,
      );
      const data = res?.data?.data;
      if (data) {
        setState({
          enableGoogle: data.enable_google_reviews ?? false,
          enableFacebook: data.enable_facebook_reviews ?? false,
          enableInstagram: data.enable_instagram_reviews ?? false,
          enableRed: data.enable_xiaohongshu_reviews ?? false,
          googleReviewLink: data.google_review_url || DEFAULT_URLS.google,
          facebookReviewLink: data.facebook_page_url || DEFAULT_URLS.facebook,
          instagramReviewLink: data.instagram_url || DEFAULT_URLS.instagram,
          redReviewLink: data.xiaohongshu_url || DEFAULT_URLS.red,
        });
      }
    } catch (error) {
      console.error("Failed to load platform settings:", error);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = useCallback(
    async (isGlobal = false) => {
      if (!merchantId) return;
      if (!isGlobal) setSaving(true);
      try {
        const payload = {
          merchant_id: merchantId,
          enable_google_reviews: state.enableGoogle,
          enable_facebook_reviews: state.enableFacebook,
          enable_instagram_reviews: state.enableInstagram,
          enable_xiaohongshu_reviews: state.enableRed,
          google_review_url: state.enableGoogle ? state.googleReviewLink : null,
          facebook_page_url: state.enableFacebook
            ? state.facebookReviewLink
            : null,
          instagram_url: state.enableInstagram
            ? state.instagramReviewLink
            : null,
          xiaohongshu_url: state.enableRed ? state.redReviewLink : null,
        };
        await axiosInstance.patch(
          `/merchant-settings/merchant/${merchantId}`,
          payload,
        );
        if (!isGlobal) {
          toast.success("Platforms Updated", {
            description: "Your social review links have been updated.",
          });
        }
      } catch (error) {
        console.error("Failed to save platform settings:", error);
        if (!isGlobal) {
          toast.error("Save Failed", {
            description: "Could not update platforms. Please try again.",
          });
        }
        throw error;
      } finally {
        if (!isGlobal) setSaving(false);
      }
    },
    [merchantId, state],
  );

  useEffect(() => {
    const onSettingsUpdate = (e) => {
      const updates = {};
      if (e.detail?.enable_google_reviews !== undefined)
        updates.enableGoogle = e.detail.enable_google_reviews;
      if (e.detail?.enable_facebook_reviews !== undefined)
        updates.enableFacebook = e.detail.enable_facebook_reviews;
      if (e.detail?.enable_instagram_reviews !== undefined)
        updates.enableInstagram = e.detail.enable_instagram_reviews;
      if (e.detail?.enable_xiaohongshu_reviews !== undefined)
        updates.enableRed = e.detail.enable_xiaohongshu_reviews;

      if (Object.keys(updates).length > 0) {
        setState((p) => ({ ...p, ...updates }));
      }
    };
    window.addEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
    return () =>
      window.removeEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
  }, []);

  return (
    <Card className="border-border/40 shadow-sm transition-all duration-300 hover:shadow-md bg-white rounded-2xl overflow-hidden group">
      <div className="p-4 flex items-center justify-between border-b border-border/40 bg-linear-to-b from-gray-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100/50 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Share2 className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm text-gray-900 leading-none">
              Social Connect
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              Review channels
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-rows-[1fr] transition-all duration-500 ease-in-out">
        <div className="overflow-hidden">
          <CardContent className="px-4 space-y-4">
            <div className="grid gap-3">
              {[
                {
                  id: "google",
                  label: "Google Reviews",
                  icon: Globe,
                  color: "text-blue-600",
                  enabled: state.enableGoogle,
                  value: state.googleReviewLink,
                  onChange: (v) =>
                    setState((p) => ({ ...p, googleReviewLink: v })),
                  placeholder: "https://g.page/r/...",
                },
                {
                  id: "facebook",
                  label: "Facebook Page",
                  icon: Facebook,
                  color: "text-blue-700",
                  enabled: state.enableFacebook,
                  value: state.facebookReviewLink,
                  onChange: (v) =>
                    setState((p) => ({ ...p, facebookReviewLink: v })),
                  placeholder: "https://facebook.com/...",
                },
                {
                  id: "instagram",
                  label: "Instagram",
                  icon: Instagram,
                  color: "text-pink-600",
                  enabled: state.enableInstagram,
                  value: state.instagramReviewLink,
                  onChange: (v) =>
                    setState((p) => ({ ...p, instagramReviewLink: v })),
                  placeholder: "https://instagram.com/...",
                },
                {
                  id: "red",
                  label: "XiaoHongShu",
                  icon: MessageCircle,
                  color: "text-red-600",
                  enabled: state.enableRed,
                  value: state.redReviewLink,
                  onChange: (v) =>
                    setState((p) => ({ ...p, redReviewLink: v })),
                  placeholder: "RED Profile URL",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${item.enabled ? "bg-white border-gray-200" : "bg-gray-50/50 border-gray-100 opacity-70"}`}
                >
                  <div className={`p-2 rounded-lg bg-gray-50 ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 grid gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">
                        {item.label}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${item.enabled ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-100 text-gray-400 border-gray-200"}`}
                      >
                        {item.enabled ? "ACTIVE" : "OFF"}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => item.onChange(e.target.value)}
                      placeholder={item.placeholder}
                      className="w-full text-xs border-none bg-transparent p-0 focus:outline-none placeholder:text-muted-foreground/50 h-5"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => handleSave(false)}
                disabled={saving}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-blue-200 transition-all h-8 px-4 text-xs font-semibold rounded-lg w-full"
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : (
                  <Save className="h-3 w-3 mr-2" />
                )}
                Save Platforms
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
