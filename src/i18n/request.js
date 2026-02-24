import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export const namespaces = [
  "Homepage",
  "signin",
  "merchantDashboard",
  "sidebar",
  "merchantCoupons",
  "merchantWallet",
  "merchantSettings",
  "merchantCampaigns",
  "merchantFestival",
  "systemLogs",
  "common",
  "merchantPurchase",
  "homepagePush",
  "agentHomepagePush",
  "superAdminHomepagePush",
];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  const namespacePromises = namespaces.map((ns) =>
    import(`../../locales/${locale}/${ns}.json`)
      .then((m) => m.default)
      .catch(() => ({})),
  );

  const namespaceModules = await Promise.all(namespacePromises);

  const messages = namespaces.reduce((acc, ns, index) => {
    acc[ns] = namespaceModules[index];
    return acc;
  }, {});

  return {
    locale,
    messages,
  };
});
