"use client";

import { use, useMemo, useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, QrCode, Phone, UserRound, Globe2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AgentRegisterPage({ params }) {
  const { locale } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isDisabled = useMemo(
    () =>
      loading ||
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim(),
    [loading, name, email, phone, password],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: "agent",
          ...(domain.trim() && { domain: domain.trim() }),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message =
          data?.message ||
          data?.error ||
          "Unable to complete agent registration";
        throw new Error(message);
      }

      setSuccess("Registration submitted. You can sign in once approved.");
      setTimeout(() => {
        router.push(`/${locale}/login`);
        router.refresh();
      }, 800);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center">
        {/* Left summary */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <ShieldCheck className="h-4 w-4" />
            Agent onboarding
          </div>
          <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Become a white-label agent for QR reviews & coupons.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Register with minimal details. Once approved, you can provision merchants,
            issue QR feedback links, and manage WhatsApp follow-ups from your portal.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: QrCode, label: "Launch QR campaigns fast" },
              { icon: Phone, label: "WhatsApp-ready flows" },
              { icon: UserRound, label: "Multi-tenant isolation" },
              { icon: ShieldCheck, label: "Role-based access" },
            ].map(({ icon: Icon, label }) => (
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

        {/* Right form */}
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl border border-border bg-card/90 p-8 shadow-2xl shadow-primary/10 backdrop-blur">
            <div className="mb-6 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Agent registration
              </p>
              <h2 className="text-2xl font-bold text-foreground">
                Tell us the basics
              </h2>
              <p className="text-sm text-muted-foreground">
                We only need your core contact info to get you started.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Full name
                </label>
                <Input
                  placeholder="Alex Agent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Work email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Phone / WhatsApp
                </label>
                <Input
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Domain / Subdomain (optional)
                </label>
                <Input
                  placeholder="e.g. agentname.yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  autoComplete="off"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe2 className="h-3.5 w-3.5" />
                  <span>
                    Optional: preferred tenant domain; final mapping happens after approval.
                  </span>
                </div>
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
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-300/60 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isDisabled}>
                {loading ? "Submitting..." : "Submit registration"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Already registered? Sign in
              </Link>
              <span className="text-xs">
                You’ll get access after admin approval.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

