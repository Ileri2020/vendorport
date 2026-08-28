"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/store/providers";
import { AppContextProvider } from "@/context/appContext";
import { NotificationUI } from "@/components/myComponents/subs/NotificationUI";
import { CartProvider } from "@/hooks/use-cart";
import { VisitTracker } from "@/components/utility/VisitTracker";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { LoginPopup } from "@/components/myComponents/subs/LoginPopup";

export default function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider
      session={session}
      refetchOnWindowFocus={false}
      refetchInterval={0}
      refetchWhenOffline={false}
    >
      <AppContextProvider>
        <Providers>
          <CartProvider businessSlug="platform">
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <VisitTracker />
              <LoginPopup />
              <NotificationUI />
              {children}
            </ThemeProvider>
          </CartProvider>
        </Providers>
      </AppContextProvider>
    </SessionProvider>
  );
}
