"use client"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { CiMenuFries } from "react-icons/ci"
import { AiOutlineSetting } from "react-icons/ai"
import Links from "../../data/links";
import { ModeToggle } from '@/components/ui/mode-toggle'
import { usePathname } from 'next/navigation';
import { GlobalSearch } from "../myComponents/subs/GlobalSearch"
import { useEffect, useState } from "react"
import axios from "axios"
import { ChevronRight, LayoutGrid, Stethoscope, Tag, ShoppingCart, MessageSquare, Camera, LogOut, BarChart3 } from "lucide-react"
import { Cart } from "../myComponents/subs/cart"
import { Button } from "../ui/button";
import { SnapPrescription } from "../myComponents/subs/SnapPrescription";
import { SpecialOrderForm } from "../myComponents/subs/SpecialOrderForm";
import { FlaskConical } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";
import { signOut, useSession } from "next-auth/react";
import { Login, Signup } from "../myComponents/subs";
import Image from "next/image";
import greenlogo from "@/public/greenlogo.png";

interface SidenavProps {
    basePath?: string;
    business?: any;
}

const Sidenav = ({ basePath, business }: SidenavProps) => {
    const { user, setUser, currentBusiness } = useAppContext();
    const { data: session } = useSession();
    const pathname = usePathname();
    const [categories, setCategories] = useState<any[]>([]);
    const [concerns, setConcerns] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllConcerns, setShowAllConcerns] = useState(false);
    const brandName = basePath
        ? business?.name || currentBusiness?.name || "VendorPort"
        : "VendorPort";
    const customLogo = basePath
                ? currentBusiness?.siteSettings?.logoImageUrl ||
                    currentBusiness?.siteSettings?.logoUrl ||
                    business?.siteSettings?.logoImageUrl ||
                    business?.siteSettings?.logoUrl ||
                    greenlogo
        : greenlogo;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const businessId = business?.id || currentBusiness?.id;
                const categoryQuery = businessId ? `?model=category&businessId=${businessId}` : "?model=category";
                const [catRes, concernRes] = await Promise.all([
                    axios.get(`/api/dbhandler${categoryQuery}`),
                    axios.get("/api/dbhandler?model=healthConcern")
                ]);
                setCategories(catRes.data);
                setConcerns(concernRes.data.map((c: any) => c.name));
            } catch (error) {
                console.error("Error fetching sidebar data:", error);
            }
        };
        fetchData();
    }, [business?.id, currentBusiness?.id]);

    const closeSheet = () => setOpen(false);
    const homeHref = basePath ? `${basePath}/home` : "/";

    const resolveHref = (path: string) => {
        if (path === "/home") return homeHref;
        if (!basePath) return path;
        return `${basePath}${path}`;
    };

    const normalizePath = (path: string | null | undefined) => {
        if (!path) return "/";
        const normalized = path.replace(/\/+$/, "");
        return normalized || "/";
    };

    const isActive = (path: string) => {
        const currentPath = normalizePath(pathname);
        const targetPath = path === "/home" && !basePath ? "/" : path === "/store" && basePath ? "/" : path;

        if (basePath) {
            const storePath = currentPath === normalizePath(basePath)
                ? "/"
                : currentPath.startsWith(`${normalizePath(basePath)}/`)
                    ? currentPath.slice(normalizePath(basePath).length)
                    : currentPath;
            const target = normalizePath(targetPath);
            return storePath === target || storePath.startsWith(`${target}/`);
        }

        const target = normalizePath(targetPath);
        return currentPath === target || currentPath.startsWith(`${target}/`);
    };

    const displayedCategories = showAllCategories ? categories : categories.slice(0, 10);
    const displayedConcerns = showAllConcerns ? concerns : concerns.slice(0, 10);
    const isPharmacyTemplate = String(currentBusiness?.template || "estore").toLowerCase() === "pharmacy";

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex justify-center items-center text-[32px] text-accent p-2 hover:bg-accent/10 rounded-xl transition-all">
                <CiMenuFries />
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[300px] sm:w-[400px] p-0 gap-0 border-r-0 bg-background shadow-2xl">
                <SheetHeader className="p-3 border-b bg-background">
                    <SheetTitle asChild>
                        <Link href={homeHref} onClick={closeSheet} className="flex items-center gap-3 text-left text-2xl font-black text-primary tracking-tighter italic">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-accent/60 bg-accent/10 shadow-md shadow-accent/20">
                                <Image src={customLogo} alt={`${brandName} logo`} width={48} height={48} className="h-10 w-10 object-contain" />
                            </div>
                            <span>{brandName}</span>
                        </Link>
                    </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1 scrollbar-hide">
                    {/* Cart & Talk Action */}
                    <div className="flex gap-2 md:gap-4">
                        <Cart className="flex-1" />
                        <Link 
                            href={resolveHref("/contact")} 
                            onClick={closeSheet}
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-accent text-accent-foreground rounded-2xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Chat
                        </Link>
                    </div>

                    {/* Search Section */}
                    <div className="space-y-1 bg-muted/30 p-2 rounded-3xl border border-border/50">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                             Quick Find
                        </h3>
                        <GlobalSearch placeholder="Find meds..." className="h-12 rounded-2xl border-none shadow-sm focus-visible:ring-primary" businessId={business?.id} />
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-2">Main Menu</h3>
                        <nav className="flex flex-col gap-1">
                            {(() => {
                                const navLinks = Links.Links.filter((link) => !(basePath && link.path === "/jobs"));
                                const isStoreOwner =
                                    basePath &&
                                    currentBusiness?.ownerId &&
                                    ((user?.id && user.id !== "nil" && String(currentBusiness.ownerId) === String(user.id)) ||
                                     (session?.user?.id && String(currentBusiness.ownerId) === String(session.user.id)));

                                if (isStoreOwner) {
                                    navLinks.push({ name: <AiOutlineSetting />, title: "Store Admin", path: "/admin" });
                                    navLinks.push({ name: <BarChart3 className="w-5 h-5" />, title: "Analytics", path: "/admin/analytics" });
                                }

                                return navLinks.map((link, index) => {
                                    const active = isActive(link.path);
                                    return <Link 
                                        href={resolveHref(link.path)} 
                                        key={index} 
                                        onClick={closeSheet}
                                        aria-current={active ? "page" : undefined}
                                        className={`${active ? "text-accent-foreground shadow-lg shadow-accent/20" : "text-foreground hover:bg-muted"} flex items-center justify-between p-4 rounded-2xl transition-all group`}
                                        style={active ? { backgroundColor: "hsl(var(--accent))" } : undefined}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl border ${active ? "bg-white/20 border-white/30" : "bg-muted border-border group-hover:border-primary/30 group-hover:bg-primary/5"} transition-all`}>
                                                <span className="text-xl shrink-0">{link.name}</span>
                                            </div>
                                            <span className="font-bold tracking-tight">{link.title}</span>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 transition-all ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                                    </Link>;
                                });
                            })()}
                        </nav>
                    </div>

                    {/* Categories Section */}
                    {categories.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 px-2">
                                <LayoutGrid className="w-4 h-4" />
                                Categories
                            </h3>
                            <div className="grid grid-cols-1 gap-1">
                                {displayedCategories.map((category) => (
                                    <Link 
                                        key={category.id}
                                        href={resolveHref(`/store?category=${encodeURIComponent(category.name)}`)}
                                        onClick={closeSheet}
                                        className="text-sm p-3 hover:bg-muted rounded-xl flex items-center justify-between group transition-all"
                                    >
                                        <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{category.name}</span>
                                        <span className="text-[10px] font-bold bg-muted border border-border/50 group-hover:bg-primary/10 group-hover:text-primary px-2.5 py-1 rounded-full transition-all">{category._count?.products || 0}</span>
                                    </Link>
                                ))}
                            </div>
                            {categories.length > 10 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setShowAllCategories(!showAllCategories)}
                                    className="w-full text-xs font-bold text-primary hover:bg-primary/5 mt-2"
                                >
                                    {showAllCategories ? "Show Less" : `Show More (${categories.length - 10} more)`}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Health Concerns Section */}
                    {concerns.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 px-2">
                                <Stethoscope className="w-4 h-4" />
                                Health Concern
                            </h3>
                            <div className="flex flex-wrap gap-2 px-2 pb-2">
                                {displayedConcerns.map((concern) => (
                                    <Link 
                                        key={concern}
                                        href={resolveHref(`/store?concern=${concern}`)}
                                        onClick={closeSheet}
                                        className="text-xs px-4 py-2 bg-muted/50 hover:bg-primary hover:text-primary-foreground rounded-full border border-border/50 transition-all font-bold"
                                    >
                                        {concern}
                                    </Link>
                                ))}
                            </div>
                            {concerns.length > 10 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setShowAllConcerns(!showAllConcerns)}
                                    className="w-full text-xs font-bold text-primary hover:bg-primary/5"
                                >
                                    {showAllConcerns ? "Show Less" : `Show More (${concerns.length - 10} more)`}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-1 border-t bg-muted/20 space-y-2">
                    <SnapPrescription>
                        <Button className="w-full flex items-center gap-3 h-12 rounded-2xl bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 font-bold">
                            <Camera className="w-5 h-5" />
                            {isPharmacyTemplate ? "Snap or List Prescription" : "AI Shopping"}
                        </Button>
                    </SnapPrescription>
                    {isPharmacyTemplate && (
                        <SpecialOrderForm>
                            <Button className="w-full flex items-center gap-3 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all font-bold">
                                <FlaskConical className="w-5 h-5" />
                                Scarce / Special Order
                            </Button>
                        </SpecialOrderForm>
                    )}
                </div>

                <div className="p-1 border-t bg-muted/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        {user.id !== "nil" ? (
                            <div className="flex items-center gap-3 bg-background/50 p-2 rounded-2xl flex-1 border border-border/50">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shrink-0">
                                    <img 
                                        src={user.avatarUrl || user.image || "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png"} 
                                        alt={user.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black truncate">{user.name}</p>
                                     <button 
                                        onClick={async () => {
                                            try {
                                                await signOut({ redirect: false });
                                            } catch (e) {
                                                console.error("Sign out error", e);
                                            }
                                            setUser({
                                                name: "visitor",
                                                id: "nil",
                                                email: "nil",
                                                avatarUrl: "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png",
                                                role: "user",
                                                contact: "xxxx",
                                                walletBalance: 0,
                                                walletCurrency: "₦"
                                            });
                                            window.location.href = window.location.origin;
                                        }}
                                        className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:text-red-600 transition-colors"
                                    >
                                        <LogOut className="w-3 h-3" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-1">
                                <Login />
                                <Signup />
                            </div>
                        )}
                        <ModeToggle />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default Sidenav
