"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  Cloud,
  Code2,
  Database,
  Globe,
  Instagram,
  Layers3,
  Linkedin,
  Mail,
  Palette,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const services = [
  { icon: Globe, title: "Websites that make an entrance", text: "Landing pages, portfolios, and company websites with clear messaging, responsive layouts, and a polished identity." },
  { icon: ShoppingBag, title: "Digital storefronts that work", text: "E-commerce and pharmacy platforms with catalogues, checkout, payments, orders, customer accounts, and admin tools." },
  { icon: Smartphone, title: "Mobile experiences", text: "Purposeful mobile apps that put your products, services, and workflows where your customers already are." },
  { icon: Layers3, title: "Content platforms", text: "Media websites designed for frequent publishing, search, rich uploads, cloud storage, and growing audiences." },
];

const audiences = [
  { icon: Users, title: "Individuals & personal brands", text: "Portfolio websites and landing pages that communicate your work clearly and help the right people find you." },
  { icon: Building2, title: "Companies & organisations", text: "Professional websites that explain what you do, build confidence, and support enquiries from customers and partners." },
  { icon: Target, title: "Growing digital businesses", text: "Web and mobile products with the data, workflows, and integrations needed to turn attention into useful action." },
];

const websitePlans = [
  { name: "Basic Static Website", price: "About N100,000", label: "Start simple", description: "A focused, fast online presence for a portfolio, personal brand, landing page, or small business.", icon: Globe, includes: ["Responsive modern design", "Landing page or portfolio layout", "About, services, gallery, and contact sections", "Deployment and basic SEO setup", "No database required"] },
  { name: "Company Website", price: "N400,000", label: "Build credibility", description: "A professional digital home for a company that needs more depth without a heavy database.", icon: Building2, includes: ["Everything in Basic", "Multiple pages and service sections", "Company profile, team, and enquiry sections", "Contact and enquiry forms", "Lightweight content management and analytics"] },
  { name: "E-commerce & Pharmacy Website", price: "N800,000", label: "Sell online", description: "A complete selling platform with the data and workflows needed to run a growing online business.", icon: ShoppingBag, includes: ["Product catalogue, categories, and variants", "Cart, checkout, payments, and order management", "Customer accounts and administration", "Full database setup", "Deployment and launch support"] },
  { name: "Media Website", price: "N1,000,000", label: "Publish at scale", description: "A content-rich platform for publishers, communities, and organisations with substantial media.", icon: Cloud, includes: ["Content publishing workflow", "Large database and cloud bucket setup", "Image, video, and document uploads", "Search and organised content library", "Performance and deployment optimisation"] },
];

const principles = [
  { icon: Palette, title: "Clarity before decoration", text: "Every screen has a job. We shape content and interfaces so visitors know what to do next." },
  { icon: Zap, title: "Optimised for real use", text: "We care about speed, responsive behaviour, accessible interactions, and maintainable foundations." },
  { icon: ShieldCheck, title: "Built with care", text: "Your product deserves dependable engineering, thoughtful testing, and support beyond launch day." },
];

const process = [
  "Understand your audience, goals, and business workflow",
  "Plan the experience and technical foundation",
  "Design, build, test, and refine the product",
  "Deploy with support for what comes next",
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

export default function About() {
  const socialLinks = [
    { label: "Instagram", href: "https://www.instagram.com/ileritech", icon: Instagram },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/ileritech", icon: Linkedin },
    { label: "Email us", href: "mailto:hello@ileritech.com", icon: Mail },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-muted/20">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <motion.section variants={fadeUp} className="relative px-4 py-20 md:px-8 md:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-primary/10 [clip-path:polygon(38%_0,100%_0,100%_100%,0_100%)]" />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-primary/50 px-4 py-1 text-sm text-primary animate-pulse">About IleriTech</Badge>
                <Badge className="gap-2 border-primary bg-primary/15 px-4 py-1 text-sm text-primary shadow-sm"><Sparkles className="h-3.5 w-3.5" /> Nigeria&apos;s No. 1 website, mobile &amp; desktop app developers</Badge>
              </div>
              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">We turn good ideas into <span className="text-primary">useful digital products.</span></h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed md:text-xl">IleriTech (IT) LTD creates modern, optimised websites and mobile apps for people and businesses ready to be taken seriously online.</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="/contact#website-plans" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground transition hover:bg-primary/90">Start a project <ArrowRight className="h-4 w-4" /></Link><a href="#website-plans" className="inline-flex items-center gap-2 rounded-md border-2 px-5 py-3 font-semibold transition hover:border-primary/70 hover:text-primary/70 border-primary text-primary">Explore plans <ArrowRight className="h-4 w-4" /></a></div>
            </div>
            <div className="mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-background/15 bg-background/15 sm:grid-cols-4">{[{ value: "01", label: "Clear strategy" }, { value: "02", label: "Strong design" }, { value: "03", label: "Reliable build" }, { value: "04", label: "Launch support" }].map((item) => <div key={item.value} className="bg-foreground/90 p-4"><p className="text-2xl font-black text-primary">{item.value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-background/60">{item.label}</p></div>)}</div>
          </div>
        </motion.section>

        <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 md:px-8 md:py-24">
          <motion.section variants={fadeUp} className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end"><div><p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Who we are</p><h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Technology should feel like momentum.</h2></div><div className="space-y-4 text-lg leading-relaxed text-muted-foreground"><p>IleriTech is a technology company focused on making digital products clearer, faster, and more valuable. We bring design thinking and practical engineering together so your website or app supports the way your business actually works.</p><p>From the first conversation to deployment and beyond, we help turn a rough idea into a dependable experience your customers can trust.</p></div></motion.section>

          <motion.section variants={fadeUp} className="space-y-8"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-primary">What we do</p><h2 className="mt-3 text-3xl font-black md:text-4xl">Digital foundations with a clear purpose.</h2><p className="mt-4 leading-relaxed text-muted-foreground">Our work combines strategy, interface design, engineering, and optimisation to create products that look right and work reliably.</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{services.map(({ icon: Icon, title, text }) => <Card key={title} className="border-border/70 bg-card/80 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"><CardHeader><div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><CardTitle className="text-lg leading-tight">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-relaxed text-muted-foreground">{text}</CardContent></Card>)}</div></motion.section>

          <motion.section variants={fadeUp} className="grid gap-5 sm:grid-cols-3">{audiences.map(({ icon: Icon, title, text }) => <Card key={title} className="bg-background/60"><CardHeader className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent className="text-center text-sm leading-relaxed text-muted-foreground">{text}</CardContent></Card>)}</motion.section>

          <motion.section variants={fadeUp} className="grid gap-6 md:grid-cols-2"><Card className="border-primary/20 bg-primary/5"><CardContent className="flex h-full flex-col items-start gap-5 p-8"><div className="rounded-xl bg-primary/10 p-4"><Code2 className="h-9 w-9 text-primary" /></div><div><h3 className="text-2xl font-bold">Smart systems, not just pretty screens</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">We connect thoughtful interfaces to the right technical foundation: databases, authentication, payments, content workflows, cloud storage, analytics, and automation where they add real value.</p></div></CardContent></Card><Card className="border shadow-sm"><CardHeader><CardTitle className="text-xl">Our standards</CardTitle><CardDescription>What we bring to every project.</CardDescription></CardHeader><CardContent className="space-y-4">{principles.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><Icon className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><p className="font-bold">{title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p></div></div>)}</CardContent></Card></motion.section>

          <Separator />

          <motion.section variants={fadeUp} id="website-plans" className="scroll-mt-8 space-y-9"><div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end"><div><Badge variant="outline" className="border-primary/40 px-4 py-1 text-sm text-primary">Website plans</Badge><h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">A practical starting point for every stage.</h2></div><p className="leading-relaxed text-muted-foreground">These plans give you a clear direction without forcing every project into the same box. Final scope is confirmed around your goals, content, integrations, data, and storage needs.</p></div><div className="grid gap-5 lg:grid-cols-2">{websitePlans.map((plan, index) => { const Icon = plan.icon; return <Card key={plan.name} className={`relative flex h-full flex-col overflow-hidden ${index === 2 ? "border-primary shadow-lg shadow-primary/10" : "shadow-sm"}`}><div className="absolute right-0 top-0 rounded-bl-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{plan.label}</div><CardHeader className="pb-4"><Icon className="mb-4 h-8 w-8 text-primary" /><CardTitle className="max-w-[80%] text-2xl">{plan.name}</CardTitle><p className="text-3xl font-black text-primary">{plan.price}</p><CardDescription className="leading-relaxed">{plan.description}</CardDescription></CardHeader><CardContent className="flex flex-1 flex-col justify-between gap-7"><div className="space-y-3">{plan.includes.map((item) => <div key={item} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item}</span></div>)}</div><Link href="/contact#website-plans" className="inline-flex items-center gap-2 font-bold text-primary hover:underline">Discuss this plan <ArrowRight className="h-4 w-4" /></Link></CardContent></Card>; })}</div></motion.section>

          <motion.section variants={fadeUp} className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]"><div className="rounded-2xl bg-primary p-8 text-primary-foreground md:p-10"><Sparkles className="h-8 w-8" /><h2 className="mt-6 text-3xl font-black md:text-4xl">More than a launch.</h2><p className="mt-4 max-w-xl leading-relaxed text-primary-foreground/80">Every app and website we create comes with three months of free testing after deployment. During that period, we help identify issues, make fixes, and discuss upgrades that keep your product moving forward.</p><div className="mt-7 flex flex-wrap gap-2 text-sm font-semibold"><span className="rounded-full bg-primary-foreground/15 px-3 py-2">Testing</span><span className="rounded-full bg-primary-foreground/15 px-3 py-2">Fixes</span><span className="rounded-full bg-primary-foreground/15 px-3 py-2">Upgrade guidance</span></div></div><div className="rounded-2xl border bg-card p-8 md:p-10"><Rocket className="h-8 w-8 text-primary" /><h2 className="mt-6 text-2xl font-black">How we work</h2><div className="mt-6 space-y-5">{process.map((step, index) => <div key={step} className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">{index + 1}</span><p className="pt-1 text-sm leading-relaxed text-muted-foreground">{step}</p></div>)}</div></div></motion.section>

          <motion.section variants={fadeUp} className="relative overflow-hidden rounded-2xl bg-foreground p-8 text-background md:p-12"><div className="relative z-10 max-w-3xl"><p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Custom plan</p><h2 className="mt-4 text-3xl font-black md:text-5xl">Have a bigger idea or a different kind of problem?</h2><p className="mt-5 leading-relaxed text-background/70">Tell us what you want to build. We will help you choose the right features, architecture, database, cloud storage, and support plan instead of selling you complexity you do not need.</p><Link href="/contact#website-plans" className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground transition hover:bg-primary/90">Talk to IleriTech <ArrowRight className="h-4 w-4" /></Link></div><Search className="absolute -bottom-10 -right-5 h-56 w-56 rotate-12 text-primary/10" /></motion.section>

          <motion.footer variants={fadeUp} className="border-t border-primary/10 pt-8 text-center"><p className="text-lg font-bold text-primary">IleriTech (IT) LTD</p><p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Modern websites. Useful apps. Thoughtful technology for businesses ready to grow.</p><div className="mt-6 flex flex-wrap items-center justify-center gap-3">{socialLinks.map(({ label, href, icon: Icon }) => <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"><Icon className="h-4 w-4" />{label}</a>)}<Link href="/contact" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">Contact us <ArrowRight className="h-4 w-4" /></Link></div></motion.footer>
        </div>
      </motion.div>
    </main>
  );
}
