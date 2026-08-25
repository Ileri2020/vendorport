"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, Database, Globe, Instagram, Linkedin, Mail, MessageCircle, Smartphone, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/hooks/useAppContext";

const websitePlans = [
  { name: "Basic Static Website", price: "About N100,000", description: "A fast, polished online presence for individuals and small brands.", includes: ["Responsive modern design", "Landing page or portfolio website", "About, services, gallery, and contact sections", "Deployment and basic SEO setup", "No database required"], icon: Globe },
  { name: "Company Website", price: "N400,000", description: "A professional digital home for a company that does not need a large database.", includes: ["Everything in Basic", "Multiple pages and service sections", "Contact and enquiry forms", "Company profile and team sections", "Lightweight content management and analytics"], icon: Users },
  { name: "E-commerce & Pharmacy Website", price: "N800,000", description: "A complete online selling platform with the database and workflows to operate confidently.", includes: ["Product catalogue, categories, and variants", "Cart, checkout, payments, and order management", "Customer accounts and administration", "Full database setup", "Deployment and launch support"], icon: Database },
  { name: "Media Website", price: "N1,000,000", description: "A content-rich platform for publishers and organisations with substantial media.", includes: ["Content publishing workflow", "Large database and cloud bucket setup", "Image, video, and document uploads", "Search and organised content library", "Performance and deployment optimisation"], icon: MessageCircle },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } };

export default function About() {
  const { currentBusiness } = useAppContext();
  const settings = currentBusiness?.siteSettings || {};
  const storeSlug = currentBusiness?.name?.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "ileritech";
  const basePath = `/${storeSlug}`;
  const brandName = "IleriTech (IT) LTD";
  const socialLinks = [
    { label: "Instagram", href: settings.instagram || "https://www.instagram.com/ileritech", icon: Instagram },
    { label: "LinkedIn", href: settings.linkedin || "https://www.linkedin.com/company/ileritech", icon: Linkedin },
    { label: "Email us", href: settings.contactEmail ? `mailto:${settings.contactEmail}` : "mailto:hello@ileritech.com", icon: Mail },
  ];

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-12 md:px-8">
      <motion.div initial="hidden" animate="visible" className="mx-auto max-w-5xl space-y-14">
        <motion.header variants={fadeUp} className="mx-auto max-w-3xl space-y-5 text-center">
          <Badge variant="outline" className="border-primary/30 px-4 py-1 text-sm text-primary">About IleriTech</Badge>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">Digital products built for <span className="text-primary">modern business.</span></h1>
          <p className="text-lg leading-relaxed text-muted-foreground">{brandName} creates modern, optimised websites and mobile apps that help businesses look credible, work efficiently, and grow online.</p>
        </motion.header>

        <motion.section variants={fadeUp} className="grid gap-6 md:grid-cols-2">
          <Card className="border-t-4 border-t-primary shadow-sm"><CardHeader><Users className="mb-2 h-8 w-8 text-primary" /><CardTitle className="text-2xl">Who We Are</CardTitle></CardHeader><CardContent className="leading-relaxed text-muted-foreground">IleriTech is a product-minded technology company focused on thoughtful design, dependable engineering, and digital experiences that are easy for people to use and businesses to manage.</CardContent></Card>
          <Card className="border-t-4 border-t-indigo-500 shadow-sm"><CardHeader><Smartphone className="mb-2 h-8 w-8 text-indigo-500" /><CardTitle className="text-2xl">What We Build</CardTitle></CardHeader><CardContent className="leading-relaxed text-muted-foreground">We build responsive landing pages, portfolio websites, company websites, media websites, e-commerce platforms, pharmacy websites, and mobile applications tailored to each client&apos;s goals.</CardContent></Card>
        </motion.section>

        <motion.section variants={fadeUp} className="space-y-8" id="website-plans">
          <div className="mx-auto max-w-3xl text-center"><Badge variant="outline" className="border-primary/30 px-4 py-1 text-sm text-primary">Website Plans</Badge><h2 className="mt-4 text-3xl font-black md:text-4xl">Choose the right foundation for your idea</h2><p className="mt-4 leading-relaxed text-muted-foreground">Every plan is scoped around the features, data, storage, and workflows your product actually needs. Prices are starting guides and can be refined after we understand your project.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">{websitePlans.map((plan, index) => { const Icon = plan.icon; return <Card key={plan.name} className={`flex h-full flex-col ${index === 2 ? "border-primary shadow-md" : "shadow-sm"}`}><CardHeader><Icon className="mb-3 h-8 w-8 text-primary" /><CardTitle className="text-xl">{plan.name}</CardTitle><p className="text-2xl font-black text-primary">{plan.price}</p><p className="leading-relaxed text-muted-foreground">{plan.description}</p></CardHeader><CardContent className="flex flex-1 flex-col justify-between gap-6"><div className="space-y-3">{plan.includes.map((item) => <div key={item} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item}</span></div>)}</div><Link href={`${basePath}/contact#website-plans`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">Discuss this plan <ArrowRight className="h-4 w-4" /></Link></CardContent></Card>; })}</div>
        </motion.section>

        <motion.section variants={fadeUp} className="grid gap-5 md:grid-cols-2"><Card className="border-primary/20 bg-primary/5"><CardContent className="flex gap-4 p-6"><Smartphone className="mt-1 h-7 w-7 shrink-0 text-primary" /><div><h3 className="font-bold">Web and mobile app development</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">We can extend your website into a mobile experience built around your users, products, and business workflow.</p></div></CardContent></Card><Card className="border-primary/20 bg-primary/5"><CardContent className="flex gap-4 p-6"><Check className="mt-1 h-7 w-7 shrink-0 text-primary" /><div><h3 className="font-bold">Three months of free testing and support</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">All apps we create include three months free for testing after deployment, plus upgrade and fix support as your product grows.</p></div></CardContent></Card></motion.section>

        <Separator />
        <motion.section variants={fadeUp} className="rounded-2xl bg-foreground p-7 text-background shadow-lg md:flex md:items-center md:justify-between md:gap-8"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Custom plan</p><h2 className="mt-2 text-2xl font-black">Have a different platform in mind?</h2><p className="mt-2 max-w-2xl text-sm text-background/70">Tell us what you need and we will recommend the right features, architecture, database, cloud storage, and support plan.</p></div><Link href={`${basePath}/contact#website-plans`} className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 md:mt-0">Request a custom plan <ArrowRight className="h-4 w-4" /></Link></motion.section>

        <motion.footer variants={fadeUp} className="border-t border-primary/10 pt-8 text-center"><p className="mb-6 text-lg font-bold text-primary">{brandName} - Building better digital experiences.</p><div className="flex flex-wrap items-center justify-center gap-3">{socialLinks.map(({ label, href, icon: Icon }) => <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"><Icon className="h-4 w-4" />{label}</a>)}<Link href={`${basePath}/contact`} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">Contact us <ArrowRight className="h-4 w-4" /></Link></div></motion.footer>
      </motion.div>
    </main>
  );
}
