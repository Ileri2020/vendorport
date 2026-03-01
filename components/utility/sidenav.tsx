"use client"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
//import { useLocation} from "react-router-dom"
import Link from "next/link"
import { CiMenuFries } from "react-icons/ci"
import Links from "../../data/links";
import { ModeToggle } from '@/components/ui/mode-toggle'
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppContext } from "@/hooks/useAppContext";
import { signOut } from "next-auth/react";
import dynamic from 'next/dynamic'
const Login = dynamic(() => import('@/components/myComponents/subs').then((e) => e.Login), { ssr: false, })
import { Signup } from "@/components/myComponents/subs"

const Sidenav = () => {
    const pathname = usePathname();
    const { user, setUser } = useAppContext();
    return (
        <Sheet>
            <SheetTrigger className="flex justify-center items-center text-[32px] text-accent">
                <CiMenuFries />
            </SheetTrigger>
            <SheetHeader></SheetHeader>
            <SheetTitle></SheetTitle>
            <SheetContent className="flex flex-col justify-between items-center">
                <nav className="flex flex-col justify-center items-center gap-8 text-xl">
                    {Links.Links.map((link, index) => {
                        return (
                            <Link href={link.path} key={index} className={`${link.path === pathname && "text-accent border-b-2 border-accent"} capitalize font-medium hover:text-accent transition-all flex items-center gap-2`}>
                                {link.icon}
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>
                {user?.id !== "nil" ? (
                    <div className="h-12 w-full mx-4">
                        <Button
                            className="bg-red border-2 border-red-500 text-red-600 w-full flex-1"
                            variant="outline"
                            onClick={() => {
                                signOut({ callbackUrl: "/" });
                                setUser({
                                    username: "visitor",
                                    id: "nil",
                                    email: "nil",
                                    avatarUrl: "",
                                    role: "user",
                                    department: "nil",
                                    contact: "xxxx",
                                });
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                ) : (
                    <div className="w-full">
                        <p className="font-medium text-red-500">Please log in to proceed with checkout.</p>
                        <div className="w-full h-[50vh] flex flex-col justify-center items-center">
                            <div className="font-semibold text-lg text-destructive">You are not logged in</div>
                            <div className="flex flex-row gap-5">
                                <Login />
                                <Signup />
                            </div>
                        </div>
                    </div>
                )}
                <div className="my-5 w-full flex flex-row">
                    <div className="flex w-full flex-1"></div>
                    <ModeToggle />
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default Sidenav
