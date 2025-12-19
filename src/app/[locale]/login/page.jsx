"use client";

import { use, useMemo, useState } from "react";
import { ShieldCheck, QrCode, MessageSquare, Sparkles } from "lucide-react";
import { useRouter, Link } from "@/i18n/routing";
import { login as authLogin } from "@/lib/services/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const highlights = [
  { icon: QrCode, label: "QR feedback in seconds" },
  { icon: MessageSquare, label: "WhatsApp follow-up ready" },
  { icon: ShieldCheck, label: "Tenant isolated & secure" },
];

export default function LoginPage({ params }) {
  const { locale } = use(params);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDisabled = useMemo(
    () => loading || !username.trim() || !password.trim(),
    [loading, username, password],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await authLogin(username, password);

      // Redirect based on role
      const role = (user.role || "").toLowerCase();
      if (role === "merchant") {
        router.push(`/merchant/dashboard`);
      } else if (role === "agent" || role === "admin") {
        router.push(`/agent/dashboard`);
      } else {
        router.push(`/dashboard`);
      }

      router.refresh();
    } catch (err) {
      const respData = err?.response?.data;
      let message = err?.message || "Something went wrong. Please try again.";

      if (respData) {
        if (typeof respData === "string") message = respData;
        else if (respData.message) message = respData.message;
        else message = JSON.stringify(respData);
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center">
        {/* Left: Hero */}
        <div className="flex-1 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4" />
            QR Review SaaS
          </div>
          <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Sign in to launch QR feedback, coupons, and WhatsApp nudges.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Secure, multi-tenant workspace for agents and merchants.
            View dashboards, issue coupons, and track customer feedback from one place.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-3 py-3 shadow-sm backdrop-blur"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl border border-border bg-card/90 p-8 shadow-2xl shadow-primary/10 backdrop-blur">
            <div className="mb-6 space-y-2 text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Welcome back
              </p>
              <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
              <p className="text-sm text-muted-foreground">
                Use your agent or merchant credentials to continue.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="admin or merchant"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isDisabled}>
                {loading ? "Signing in..." : "Sign in to dashboard"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                <strong>Demo Credentials:</strong><br />
                Agent: <code className="font-mono">admin / admin123</code><br />
                Merchant: <code className="font-mono">merchant / merchant123</code>
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Forgot password?
                </Link>
                <Link
                  href="/register/agent"
                  className="font-semibold text-primary hover:text-primary/80"
                >
                  Register as agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

