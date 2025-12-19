"use client";

import { use, useMemo, useState } from "react";
import { ShieldCheck, QrCode, MessageSquare, Sparkles } from "lucide-react";
import { useRouter, Link } from "@/i18n/routing";
import { login as authLogin } from "@/lib/services/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/common/language-switcher";

export default function LoginPage({ params }) {
  const { locale } = use(params);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const tSignin = useTranslations("signin");
  const tPlaceholders = useTranslations("placeholders.signin");
  const tValidation = useTranslations("validations.signin");

  const isDisabled = useMemo(
    () => loading || !username.trim() || !password.trim(),
    [loading, username, password]
  );

  const highlights = [
    { icon: QrCode, label: tSignin("label1") },
    { icon: MessageSquare, label: tSignin("label2") },
    { icon: ShieldCheck, label: tSignin("label3") },
  ];
  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   setError("");
  //   setLoading(true);

  //   try {
  //     const user = authenticateUser(username, password);

  //     if (!user) {
  //       setError(tValidation("error1"));
  //       setLoading(false);
  //       return;
  //     }

  //     // Save user to localStorage
  //     setCurrentUser(user);

  //     // Redirect based on role
  //     if (user.role === "agent") {
  //       router.push(`/agent/dashboard`);
  //     } else if (user.role === "merchant") {
  //       router.push(`/merchant/dashboard`);
  //     } else if (role === "agent" || role === "admin") {
  //       router.push(`/agent/dashboard`);
  //     } else {
  //       router.push(`/dashboard`);
  //     }

  //     router.refresh();
  //   } catch (err) {
  //     setError(err?.message || tValidation("error2"));
  //     const respData = err?.response?.data;
  //     let message = err?.message || "Something went wrong. Please try again.";

  //     if (respData) {
  //       if (typeof respData === "string") message = respData;
  //       else if (respData.message) message = respData.message;
  //       else message = JSON.stringify(respData);
  //     }

  //     setError(message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-background to-secondary/10">
      <div className="fixed right-6 top-6 z-50">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center">
        {/* Left: Hero */}
        <div className="flex-1 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4" />
            {tSignin("qrReview")}
          </div>
          <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            {tSignin("heading1")}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            {tSignin("description")}
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
                {tSignin("welcome")}
              </p>
              <h2 className="text-2xl font-bold text-foreground">
                {tSignin("signin")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tSignin("description2")}{" "}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {tSignin("label4")}
                </label>
                <Input
                  type="text"
                  placeholder={tPlaceholders("username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {tSignin("label5")}
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
                {loading
                  ? tPlaceholders("loadingText")
                  : tPlaceholders("submitLoading")}
              </Button>
            </form>

           
          </div>
        </div>
      </div>
    </div>
  );
}
