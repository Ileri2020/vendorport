"use client";
import Link from "next/link";
import Nav from "./nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import Sidenav from "./sidenav";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Suspense } from "react";
import {
  AiOutlineSearch,
  AiOutlineHome,
  AiOutlineShop,
  AiOutlineMan,
  AiOutlineContacts,
} from "react-icons/ai";
import { Advert } from "@/components/myComponents/subs";
import logo from "@/public/greenlogo.png";
import greenlogo from "@/public/greenlogo.png";
import Image from "next/image";
import { Cart } from "../myComponents/subs/cart";
import { GlobalSearch } from "../myComponents/subs/GlobalSearch";
import { NotificationBell } from "../myComponents/subs/NotificationUI";
import { useSession } from "next-auth/react";
import { useAppContext } from "@/hooks/useAppContext";
import { useEffect } from "react";
import { initializeAffiliateTracking } from "@/lib/affiliate-tracking";

export interface NavbarProps {
  basePath?: string;
  business?: any;
  businessId?: string;
}

const Navbar = ({ basePath, business, businessId }: NavbarProps): JSX.Element => {
  const { setUser, user, currentBusiness } = useAppContext();
  const { data: session, status, update } = useSession();
  const homeHref = basePath ? `${basePath}/home` : "/";
  const brandName = business?.name || currentBusiness?.name || "Vendor Hub";
  const brandSubtitle = business?.siteSettings?.aboutText || currentBusiness?.siteSettings?.aboutText || "Your one stop shop for health needs";
  const customLogo = (() => {
    const candidates = basePath
      ? [
          currentBusiness?.siteSettings?.logoImageUrl,
          currentBusiness?.siteSettings?.logoUrl,
          business?.siteSettings?.logoImageUrl,
          business?.siteSettings?.logoUrl,
        ]
      : [];

    const resolved = candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0);
    return resolved || greenlogo;
  })();

  useEffect(() => {
    if (status === "authenticated" && session?.user && user.email === "nil") {
      setUser({
        ...session.user,
        avatarUrl: session.user.image,
      });
    }
    initializeAffiliateTracking();
  }, [status, session, user.email, setUser]);

  return (
    <div className="sticky top-0 z-30 w-screen overflow-clip justify-center items-center flex flex-col m-0 p-0">
      <header className="w-[100%] bg-background sticky top-0 z-10 border-0 border-b-2 border-foreground/50">
        <div className="px-2 py-2 shadow-foreground mx-auto flex justify-between items-center max-h-[90px] overflow-visible">
          <div className="lg:hidden">
            <Sidenav basePath={basePath} business={business} />
          </div>
          <Link
            href={homeHref}
            className="flex mx-4 my-1 flex-1 md:flex-none max-h-[65px] bg-accent/10 max-w-[65px] overflow-clip border-1 border-accent shadow-md rounded-md shadow-accent justify-center items-center py-5 /rounded-full"
          >
            <Image src={customLogo} alt={`${brandName} logo`} width={80} height={80} className="h-[63px] w-auto m-1" />
          </Link>
          {/* <Link
            href={homeHref}
            className="hidden dark:flex flex-1 md:flex-none max-h-[43px] md:max-h-[50px] overflow-clip justify-center items-center py-5 /rounded-full"
          >
            <Image src={logo} alt="" className="w-[100px] h-auto" />
          </Link> */}

          {/* Business name badge — commented out
          {business && (
            <div className="hidden md:flex items-center px-3 py-1.5 rounded-full border border-border/60 bg-background/70 backdrop-blur">
              <span className="text-sm font-semibold text-foreground">{brandName}</span>
            </div>
          )}
          */}

          <div className="flex items-center gap-2 lg:hidden">
            <Cart />
            <NotificationBell />
          </div>

          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <GlobalSearch
              placeholder="Search medications..."
              className="h-10"
              businessId={businessId}
            />
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <Nav basePath={basePath} />
            {/*
                <Link to="/contact">
                  <Button className="">Hire me</Button>
                </Link>
              */}
            <Cart />
            <NotificationBell />
            <ModeToggle />
          </div>
        </div>
        {/* Show Advert section only on store pages (when business prop is provided) */}
        {business && <Advert businessName={business.name} />}
      </header>
    </div>
  );
};

export default Navbar;
