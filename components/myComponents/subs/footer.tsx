"use client";
import React from "react";
import { Facebook, Instagram, Linkedin, Twitter, Users } from "lucide-react";
import Link from "next/link";
import { SEO_CONFIG } from "../../../app/layout";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { AffiliateDialog } from "./AffiliateDialog";

export interface FooterProps {
  className?: string;
  basePath?: string;
  business?: any;
  businessId?: string;
}

export function Footer({ className, basePath, business, businessId }: FooterProps) {
  const [categories, setCategories] = React.useState<{ id: string, name: string }[]>([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const bizQ = businessId ? `&businessId=${businessId}` : "";
        const res = await fetch(`/api/dbhandler?model=category${bizQ}`);
        const data = await res.json();
        setCategories(data.slice(0, 5)); // Take first 5 for footer
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

  const socialMediaLinks = [
    { href: "#", icon: <Facebook className="h-4 w-4" />, label: "Facebook" },
    { href: "#", icon: <Twitter className="h-4 w-4" />, label: "Twitter" },
    { href: "#", icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
    { href: "#", icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
  ];
  
  const pageLinks = [
    { href: resolveHref("/home"), label: "Home" },
    { href: resolveHref("/about"), label: "About Us" },
    { href: resolveHref("/store"), label: "Store" },
    { href: resolveHref("/account"), label: "User Account" },
  ];
  
  const categoryLinks = categories.length > 0 
    ? categories.map(c => ({ href: resolveHref(`/store?category=${encodeURIComponent(c.name)}`), label: c.name }))
    : [
        { href: resolveHref("/store"), label: "All Categories" },
      ];
  
  const supportLinks = [
    { href: resolveHref("/help"), label: "Help Center" },
    { href: resolveHref("/contact"), label: "Contact Us" },
    { href: resolveHref("/privacy"), label: "Privacy Policy" },  
    { href: resolveHref("/terms"), label: "Terms of Service" },
  ];

  const advertLinks = [
    { href: resolveHref("/contact"), label: "Advertise with Us" },
    { href: resolveHref("/contact"), label: "Health Consult" },
    { href: resolveHref("/contact"), label: "Corporate Partnership" },
  ];
  
  const footerLinks = [
    { href: resolveHref("/privacy"), label: "Privacy" },
    { href: resolveHref("/terms"), label: "Terms" },
    { href: resolveHref("/cookies"), label: "Cookies" },
    { href: resolveHref("/sitemap"), label: "Sitemap" },
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
    {
      label : 'Advert',
      links : advertLinks,
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
                text-left text-2xl font-black text-primary tracking-tighter text-accent
              `}
            >
              {brandName}
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm font-medium">
            {footerDescription}
          </p>

          <div className="flex space-x-4">
             <Button
                className="h-9 w-9 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                size="icon"
                variant="ghost"
                asChild
              >
                <Link href="https://www.instagram.com/healthclique_specialties?utm_source=qr" target="_blank">
                  <Instagram className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                className="h-9 w-9 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                size="icon"
                variant="ghost"
                asChild
              >
                <Link href="mailto:healthcliquespecialties@gmail.com">
                  <Facebook className="h-5 w-5" />
                </Link>
              </Button>
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

        <div className={`grid grid-cols-2 gap-8 md:grid-cols-4`}>
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
            <div
              className={
                "flex items-center gap-4 text-sm text-muted-foreground"
              }
            >
              {
                footerLinks.map((link, index)=>(
                  <Link key={index} className="hover:text-foreground" href={link.href}>
                    {link.label}
                  </Link>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
