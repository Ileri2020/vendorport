// "use client"
// //import { Link, useLocation } from "react-router-dom"
// import Link from "next/link";
// import Links from "../../data/links";
// import { usePathname } from 'next/navigation';


// const Nav = () => {
//   const pathname = usePathname();        
//   return (
//     <nav className="flex gap-8 text-xl">
//       {Links.Links.map((link, index) => {
//         return (
//           <Link href={link.path} key={index} className={` ${link.path === pathname && "text-accent border-b-2 border-accent"} capitalize font-medium hover:text-accent transition-all`}>
//             {link.name}
//           </Link>
//         )
//       })}
//       {/* <a href="/portfolio">Portfolio</a> */}
//     </nav>
//   )
// }

// export default Nav


















"use client";

import Link from "next/link";
import Links from "../../data/links";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { BarChart, LayoutDashboard } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";

const Nav = () => {
  const pathname = usePathname();
  const { user } = useAppContext();

  const baseLinks = [...Links.Links];
  if (user?.role === "admin") {
     baseLinks.push(
        { path: "/admin", name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
        { path: "/admin/analytics", name: "Analytics", icon: <BarChart className="h-5 w-5" /> }
     );
  }

  return (
    <TooltipProvider>
      <nav className="flex gap-8 text-xl">
        {baseLinks.map((link: any, index: number) => {
          const isActive = link.path === pathname;

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Link
                  href={link.path}
                  className={`${
                    isActive &&
                    "text-accent border-b-2 border-accent"
                  } capitalize font-medium hover:text-accent transition-all flex items-center h-full`}
                >
                  {link.icon} 
                </Link>
              </TooltipTrigger>

              <TooltipContent>
                <p className="capitalize">{link.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
};

export default Nav;


