import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function AgentRegisterRedirect() {
  const targetLocale = routing.defaultLocale || "en";
  redirect(`/${targetLocale}/register/agent`);
}


