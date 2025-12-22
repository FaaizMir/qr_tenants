"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/en/login" }); // Redirect to login after logout
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}

