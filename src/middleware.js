import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const i18nMiddleware = createMiddleware(routing);

export default function middleware(req) {
  // Role-based guard (uses cookies set by client upon login)
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // only apply simple guards for these prefixes
  try {
    const roleCookie = req.cookies.get("userRole")?.value || null;
    const role = roleCookie ? roleCookie.toLowerCase() : null;

    // handle possible locale prefix (e.g. /en/merchant/...)
    const parts = pathname.split("/").filter(Boolean);
    const LOCALES = ["zh","ms","th","vi","id","ko","ja","hi","ar","en"];
    const routeSegment = LOCALES.includes(parts[0]) ? parts[1] || "" : parts[0] || "";

    if (routeSegment === "dashboard") {
      // redirect generic dashboard to role-specific dashboard
      if (role === "merchant") {
        if (LOCALES.includes(parts[0])) url.pathname = `/${parts[0]}/merchant/dashboard`;
        else url.pathname = `/merchant/dashboard`;
        return NextResponse.redirect(url);
      } else if (role === "agent" || role === "admin") {
        if (LOCALES.includes(parts[0])) url.pathname = `/${parts[0]}/agent/dashboard`;
        else url.pathname = `/agent/dashboard`;
        return NextResponse.redirect(url);
      }
    }

    if (routeSegment.startsWith("merchant")) {
      if (!role || role !== "merchant") {
        url.pathname = `/${routeSegment ? "" : ""}/login`;
        // keep locale if present
        if (LOCALES.includes(parts[0])) url.pathname = `/${parts[0]}/login`;
        return NextResponse.redirect(url);
      }
    }

    if (routeSegment.startsWith("agent") || routeSegment.startsWith("admin")) {
      if (!role || (role !== "agent" && role !== "admin")) {
        if (LOCALES.includes(parts[0])) url.pathname = `/${parts[0]}/login`;
        else url.pathname = `/login`;
        return NextResponse.redirect(url);
      }
    }
  } catch (e) {
    // if cookies not readable, proceed to i18n middleware which will handle locale routing
  }

  return i18nMiddleware(req);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(zh|ms|th|vi|id|ko|ja|hi|ar|en)/:path*",
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`), but exclude /api and static assets
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
