import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/store/providers";
import { AppContextProvider } from "@/context/appContext";
import { NotificationUI } from "@/components/myComponents/subs";
import { CartProvider } from "@/hooks/use-cart";
import { VisitTracker } from "@/components/utility/VisitTracker";
import { SessionProvider } from "next-auth/react"
import { usersession } from "@/session";
import { Session } from "next-auth";
import { LoginPopup } from "@/components/myComponents/subs/LoginPopup";

// import {Roboto} from "next/font/google"

// const roboto = Roboto({
//   subsets : ["latin"], style : "normal"
// });

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

const metadata: Metadata = {
  title: "Vendors Hub",
  description: "Modern professional smart web solution built to grow your business.",
};

export const SEO_CONFIG = {
  description:'Modern professional smart web solution built to grow your business.',
  fullName: "Vendors Hub",
  name: "Vendors Hub",
  slogan: "your business on click always",
};

export const SYSTEM_CONFIG = {
  redirectAfterSignIn: "/dashboard/uploads",
  redirectAfterSignUp: "/dashboard/uploads",
  // repoName: "relivator",
  // repoOwner: "blefnk",
  // repoStars: true,
};

// Local Session interface removed to use next-auth's global extension

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session : Session | null =  await usersession() || null;
  return (
    <html lang="en">
      <SessionProvider  session={session}>
        <AppContextProvider>
          <body
            className={`font-roboto_mono antialiased`}
            // ${geistSans.variable} ${geistMono.variable}
          >
            <Providers>
              <CartProvider businessSlug="platform">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                  >
                    {/* Navbar and Footer are rendered by child layouts:
                        - (platform)/layout.tsx  → platform pages (no business props)
                        - [storeName]/layout.tsx → business pages (with fetched business props) */}
                    <VisitTracker />
                    <LoginPopup />
                    <NotificationUI />
                    {children}
                  </ThemeProvider>
              </CartProvider>
            </Providers>
          </body>
        </AppContextProvider>
      </SessionProvider>
    </html>
  );
}
