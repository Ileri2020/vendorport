"use client";
import React from "react";
import { Facebook, Instagram, Linkedin, Mail, Twitter, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SEO_CONFIG } from "../../../app/layout";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { AffiliateDialog } from "./AffiliateDialog";
import { platformSocialLinks } from "@/data/links";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface FooterProps {
  className?: string;
  basePath?: string;
  business?: any;
  businessId?: string;
}

export function Footer({ className, basePath, business, businessId }: FooterProps) {
  const [categories, setCategories] = React.useState<{ id: string, name: string }[]>([]);
  const isStorefront = Boolean(basePath || businessId || business);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const scopeQuery = businessId
          ? `&businessId=${encodeURIComponent(businessId)}`
          : "&platform=true";
        const res = await fetch(`/api/dbhandler?model=category${scopeQuery}&limit=100`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Footer: Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [businessId]);

  const resolveHref = (path: string) => {
    if (!basePath) return path;
    return `${basePath}${path}`;
  };
  const brandName = business?.name || SEO_CONFIG.name;
  const footerDescription = business?.siteSettings?.aboutText || "Modern professional smart web solution built to grow your business.";
  const settings = business?.siteSettings;
  const socialLinks = isStorefront
    ? [
        { href: settings?.facebook, icon: Facebook, label: "Facebook" },
        { href: settings?.twitter, icon: Twitter, label: "Twitter" },
        { href: settings?.instagram, icon: Instagram, label: "Instagram" },
        { href: settings?.linkedin, icon: Linkedin, label: "LinkedIn" },
        { href: settings?.contactEmail ? `mailto:${settings.contactEmail}` : undefined, icon: Mail, label: "Email" },
      ]
    : [
        { href: platformSocialLinks.facebook, icon: Facebook, label: "Facebook" },
        { href: platformSocialLinks.twitter, icon: Twitter, label: "Twitter" },
        { href: platformSocialLinks.instagram, icon: Instagram, label: "Instagram" },
        { href: platformSocialLinks.linkedin, icon: Linkedin, label: "LinkedIn" },
        { href: platformSocialLinks.email, icon: Mail, label: "Email" },
      ];

  const pageLinks = [
    { href: resolveHref("/home"), label: "Home" },
    { href: resolveHref("/about"), label: "About Us" },
    { href: resolveHref("/store"), label: "Store" },
    { href: resolveHref("/help"), label: "Help Center" },
    { href: resolveHref("/contact"), label: "Contact Us" },
  ];

  const visibleCategories = categories.slice(0, 5);
  const categoryLinks = visibleCategories.length > 0
    ? visibleCategories.map(c => ({ href: resolveHref(`/store?category=${encodeURIComponent(c.name)}`), label: c.name }))
    : [
        { href: resolveHref("/store"), label: "All Categories" },
      ];

  const categoryHref = (categoryName: string) => resolveHref(`/store?category=${encodeURIComponent(categoryName)}`);

  const supportLinks = [
    { href: resolveHref("/help"), label: "Help Center" },
    { href: resolveHref("/contact"), label: "Contact Us" },
    { href: resolveHref("/privacy"), label: "Privacy Policy" },  
    { href: resolveHref("/terms"), label: "Terms of Service" },
  ];

  const columns = [
    {
      label : 'Pages',
      links : pageLinks,
    },
    {
      label : 'Categories',
      links : categoryLinks,
    },
    {
      label : 'Support',
      links : supportLinks,
    },
  ];
  
  
  return (
    <footer className={cn("border-t bg-background text-foreground font-sans", className)}>
      <div
        className={`container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 `}
      >
        <div className="space-y-4 mb-10">
          <Link className="flex items-center gap-0" href={basePath || "/"}>
            <span
              className={`
                text-left text-2xl font-black text-primary tracking-tighter
              `}
            >
              {brandName}
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm font-medium">
            {footerDescription}
          </p>

          <div className="flex flex-wrap gap-3">
            {socialLinks.filter((link) => link.href).map(({ href, icon: Icon, label }) => (
              <Button
                key={label}
                title={label}
                aria-label={label}
                className="h-9 w-9 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80"
                size="icon"
                variant="ghost"
                asChild
              >
                <Link href={href!} target={href!.startsWith("http") ? "_blank" : undefined} rel={href!.startsWith("http") ? "noopener noreferrer" : undefined}>
                  <Icon className="h-5 w-5" />
                </Link>
              </Button>
            ))}
          </div>

          <div className="pt-4">
            <AffiliateDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2 bg-primary/10 hover:bg-primary/20 border-primary/20">
                  <Users className="h-4 w-4" />
                  Become an Affiliate
                </Button>
              }
            />
          </div>
        </div>

          <div className={`grid grid-cols-2 gap-8 md:grid-cols-3`}>
          {columns.map((column, index) => (
            <div key={index}>
              <h3 className="mb-4 text-sm font-semibold">{column.label}</h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {column.label === "Categories" && categories.length > 5 && (
                  <li>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="inline-flex items-center gap-1 text-primary transition-colors hover:text-foreground">
                          More categories <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{isStorefront ? "Store categories" : "Platform categories"}</DialogTitle>
                          <DialogDescription>
                            Browse all categories available in this {isStorefront ? "store" : "platform"}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid max-h-[55vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              href={categoryHref(category.name)}
                              className="rounded-md border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-8">
          <div
            className={`
              flex flex-col items-center justify-between gap-4
              md:flex-row
            `}
          >
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {SEO_CONFIG.name}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link className="hover:text-foreground" href={resolveHref("/privacy")}>Privacy</Link>
              <Link className="hover:text-foreground" href={resolveHref("/terms")}>Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
