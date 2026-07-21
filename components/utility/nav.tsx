"use client"
import Link from "next/link";
import Links from "../../data/links";
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AiOutlineSetting } from "react-icons/ai";
import { BarChart3 } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";
import { useSession } from "next-auth/react";

interface NavProps {
  basePath?: string;
}

const Nav = ({ basePath }: NavProps) => {
  const pathname = usePathname();
  const { currentBusiness, user } = useAppContext();
  const { data: session } = useSession();

  const resolveHref = (path: string) => {
    if (!basePath) return path;
    return `${basePath}${path}`;
  };

  const isStoreOwner =
    basePath &&
    currentBusiness?.ownerId &&
    ((user?.id && user.id !== "nil" && String(currentBusiness.ownerId) === String(user.id)) ||
     (session?.user?.id && String(currentBusiness.ownerId) === String(session.user.id)));

  const navLinks = [...Links.Links];

  if (isStoreOwner) {
    navLinks.push({
      name: <AiOutlineSetting />,
      title: "Store Admin",
      path: "/admin",
    });
    navLinks.push({
      name: <BarChart3 />,
      title: "Analytics",
      path: "/admin/analytics",
    });
  }

  return (
    <nav className="flex gap-8 text-xl">
      <TooltipProvider>
        {navLinks.map((link, index) => {
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Link href={resolveHref(link.path)} className={` ${resolveHref(link.path) === pathname && "text-accent border-b-2 border-accent"} capitalize font-medium hover:text-accent transition-all`}>
                  {link.name}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-sm font-semibold bg-primary text-primary-foreground border-none">
                <p>{link.title}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </TooltipProvider>
    </nav>
  )
}

export default Nav

