"use client"

import React, { useEffect } from 'react';
import Link from 'next/link';
import Nav from './nav';
import { Button } from '@/components/ui/button';
import Sidenav from './sidenav';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Advert } from "@/components/myComponents/subs"
import { GlobalCart } from '../utility/GlobalCart';
import { SearchInput } from '../myComponents/subs/searchcomponent';
import { useSession } from "next-auth/react";
import { useAppContext } from '@/hooks/useAppContext';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";
import { GlobalDialog } from '../ui/GlobalDialog';
import Login from '../myComponents/subs/login';
import { usePathname, useParams } from 'next/navigation';

const Navbar = (): JSX.Element | null => {
  const { setUser, user } = useAppContext();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { storeName } = useParams();

  // Hide platform navbar UI when on a specific store route, but
  // avoid returning early so hook order remains stable between renders.
  const hideNavbar = Boolean(storeName);

  useEffect(() => {
    if (status === "authenticated" && user.email === "nil") {
      setUser({
        ...session.user,
      });
    }
  }, [status, session, user.email, setUser]);

  return (
    <TooltipProvider>
      <div className="sticky top-0 z-30 w-full overflow-clip flex flex-col m-0 p-0">
        {hideNavbar ? null : (
        <>
        <header className="w-full justify-center items-center py-1 bg-background sticky top-0 z-10 shadow-md shadow-accent/40">
          <div className="container mx-auto flex justify-between items-center gap-2 h-[60px] overflow-clip">

            {/* Sidenav Mobile */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="lg:hidden">
                  <Sidenav />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Menu</p>
              </TooltipContent>
            </Tooltip>

            {/* Logo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={"/"} className="flex flex-1 md:flex-none h-full items-center">
                   <div className="flex items-center gap-2">
                      <div className="bg-accent h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">V</div>
                      <span className="text-2xl font-black tracking-tighter hidden sm:block">VendorPort</span>
                   </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>VendorPort Home</p>
              </TooltipContent>
            </Tooltip>

            {/* Mobile Search/Cart */}
            <div className="lg:hidden relative flex items-center gap-2">
               <GlobalCart />
               {user?.email === "nil" ? <Login /> : (
                 <Link href="/create-store">
                   <Button size="sm" className="bg-accent font-bold">Build</Button>
                 </Link>
               )}
            </div>

            <div className="md:flex hidden">
              <SearchInput />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Nav />
              <GlobalCart />
              <ModeToggle />
              {user?.email === "nil" ? (
                <div className="flex gap-2">
                   <Login />
                </div>
              ) : (
                <Link href="/create-store">
                   <Button className="bg-accent hover:bg-accent/90 text-white font-bold">Create My Store</Button>
                </Link>
              )}
            </div>
          </div>
        </header>
        <Advert />
        <GlobalDialog />
        </>
        )}
      </div>
    </TooltipProvider>
  )
}

export default Navbar;
