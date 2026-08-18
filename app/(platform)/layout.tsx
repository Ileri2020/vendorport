/**
 * app/(platform)/layout.tsx
 *
 * Layout for all main platform pages (home, store, account, admin, etc.).
 * Renders the default platform Navbar and Footer — no business context.
 *
 * Route group "(platform)" does NOT affect URL paths.
 */

import Navbar from "@/components/utility/navbar";
import { Footer } from "@/components/myComponents/subs/footer";
import ColorInjector from "@/components/platform/ColorInjector";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ColorInjector business={null} />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
