import { Inter, Fira_Code } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/components/providers/session-provider";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { Toaster } from "sonner";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const paramsData = await params;
  const locale = paramsData.locale;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction}>
      <body
        className={`${inter.variable} ${firaCode.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <SubscriptionProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
              <Toaster position="top-right" />
            </NextIntlClientProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
