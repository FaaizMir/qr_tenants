import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { LogoutButton } from "@/components/providers/logout-button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { authOptions } from "@/lib/auth-options";

export default async function ProtectedLayout({ children, params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${params.locale}/login`);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div>
          <header className="flex items-center justify-between px-2 py-2 border-b border-sidebar-border bg-white">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 rounded-lg p-2 transition-all duration-200" />
              <Separator orientation="vertical" className="h-6 bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">QR Scanner</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <LogoutButton />
            </div>
          </header>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-3">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

