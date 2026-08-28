import type { Metadata } from "next";
import "./globals.css";
import { usersession } from "@/session";
import AppShell from "@/components/AppShell";
import { SEO_CONFIG, SYSTEM_CONFIG } from "@/lib/site-config";

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

export const metadata: Metadata = {
  title: "Vendors Hub",
  description: "Modern professional smart web solution built to grow your business.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};


// Local Session interface removed to use next-auth's global extension

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = (await usersession()) || null;

  return (
    <html lang="en">
      <body className="font-roboto_mono antialiased">
        <AppShell session={session}>{children}</AppShell>
      </body>
    </html>
  );
}
