"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Eye,
  EyeOff,
  Key,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";

export function StripeConfigForm() {
  const { data: session } = useSession();
  const adminId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [stripeKey, setStripeKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");

  useEffect(() => {
    fetchStripeConfig();
  }, [adminId]);

  const fetchStripeConfig = async () => {
    if (!adminId) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/admins/${adminId}`);
      const data = response.data?.data || response.data;

      // Backend returns has_stripe_key flag
      const hasExistingKey = data.has_stripe_key === true;
      setHasKey(hasExistingKey);

      if (hasExistingKey) {
        // Use masked key from backend if available, otherwise use default masking
        const masked = data.stripe_key_masked || "sk_••••••••••••••••••••••••••••";
        setMaskedKey(masked);
      }
    } catch (error) {
      console.error("Failed to fetch Stripe config:", error);
      toast.error("Failed to load Stripe configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!stripeKey.trim()) {
      toast.error("Please enter a Stripe secret key");
      return;
    }

    // Basic validation - Stripe keys start with sk_live_ or sk_test_
    if (!stripeKey.startsWith("sk_test_") && !stripeKey.startsWith("sk_live_")) {
      toast.error("Invalid Stripe key format. Key must start with sk_test_ or sk_live_");
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.patch(`/admins/${adminId}`, {
        stripe_secret_key: stripeKey,
      });

      toast.success("Stripe API key saved successfully");
      
      // Update state based on response
      const data = response.data?.data || response.data;
      setHasKey(data.has_stripe_key === true);
      
      // Use masked key from backend response
      const masked = data.stripe_key_masked || "sk_••••••••••••••••••••••••••••";
      setMaskedKey(masked);
      
      setStripeKey("");
      setShowKey(false);
    } catch (error) {
      console.error("Failed to save Stripe key:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save Stripe configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your Stripe API key? Merchants will not be able to make payments until you configure a new key.")) {
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.patch(`/admins/${adminId}`, {
        stripe_secret_key: null,
      });

      toast.success("Stripe API key removed");
      
      // Update state based on response
      const data = response.data?.data || response.data;
      setHasKey(data.has_stripe_key === true);
      setMaskedKey("");
      setStripeKey("");
    } catch (error) {
      console.error("Failed to remove Stripe key:", error);
      toast.error("Failed to remove Stripe key");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {hasKey ? (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            Stripe Connected
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your Stripe account is configured. Merchants can make payments through your Stripe account.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900 dark:text-yellow-100">
            Stripe Not Configured
          </AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Configure your Stripe API key to enable merchant payments. Without this, merchants cannot purchase credit packages or upgrade subscriptions.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-full text-purple-600">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>Stripe API Configuration</CardTitle>
              <CardDescription className="mt-1">
                Connect your Stripe account to receive merchant payments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-1">
              <div className="text-sm font-medium">Connection Status</div>
              <div className="text-xs text-muted-foreground">
                {hasKey ? "API key configured" : "No API key configured"}
              </div>
            </div>
            <div>
              {hasKey ? (
                <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>
          </div>

          {/* Current Key Display */}
          {hasKey && (
            <div className="space-y-2">
              <Label>Current API Key</Label>
              <div className="flex gap-2">
                <div className="flex-1 font-mono text-sm p-3 rounded-md border bg-muted/50">
                  {maskedKey}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={saving}
                >
                  Remove
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                For security, the full key is never displayed after saving.
              </p>
            </div>
          )}

          {/* Key Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripe_key">
                {hasKey ? "Update API Key" : "Stripe Secret Key"}
              </Label>
              <div className="relative">
                <Input
                  id="stripe_key"
                  type={showKey ? "text" : "password"}
                  placeholder="sk_test_... or sk_live_..."
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                  className="font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your Stripe secret key (starts with <code className="px-1 py-0.5 rounded bg-muted">sk_test_</code> or <code className="px-1 py-0.5 rounded bg-muted">sk_live_</code>)
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !stripeKey.trim()}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {hasKey ? "Update Key" : "Save Key"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Get Your Stripe API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
            <li>
              Log in to your{" "}
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Stripe Dashboard
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Navigate to <strong>Developers</strong> → <strong>API keys</strong></li>
            <li>Use <strong>Test mode</strong> for development or <strong>Live mode</strong> for production</li>
            <li>Copy your <strong>Secret key</strong> (starts with sk_test_ or sk_live_)</li>
            <li>Paste it in the field above and click <strong>Save Key</strong></li>
          </ol>

          <Alert className="mt-4">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription className="text-xs">
              Your Stripe secret key is encrypted and stored securely. It is never displayed in the UI after saving and is never exposed in API responses. Never share your secret key with anyone.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Business Model Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Payment Flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              1
            </div>
            <div>
              <strong className="text-foreground">Merchant Makes Payment</strong>
              <p className="text-xs mt-1">Customer purchases credit packages or annual subscription</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              2
            </div>
            <div>
              <strong className="text-foreground">100% Goes to Your Stripe</strong>
              <p className="text-xs mt-1">Full payment amount is deposited to your Stripe account</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              3
            </div>
            <div>
              <strong className="text-foreground">Platform Deducts Costs</strong>
              <p className="text-xs mt-1">Platform costs automatically deducted from your prepaid wallet</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              4
            </div>
            <div>
              <strong className="text-foreground">You Keep the Profit</strong>
              <p className="text-xs mt-1">Your profit = Merchant payment - Platform cost</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
