"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, CircleDashed, Sparkles } from "lucide-react";
import { PortfolioCard } from "@/components/myComponents/subs/PortfolioCard";

const roles = [
  {
    title: "Store Manager",
    description: "Oversee the storefront, product updates, pricing, and customer experience for growing online businesses.",
  },
  {
    title: "Product Curator",
    description: "Organize catalog content, manage categories, and ensure product listings stay accurate and attractive.",
  },
  {
    title: "Customer Support Specialist",
    description: "Handle customer questions, order support, and help maintain a polished store experience.",
  },
  {
    title: "Digital Marketing Assistant",
    description: "Support campaigns, promotions, and outreach to keep stores visible and growing.",
  },
];

export default function JobsPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const updateLayout = () => setIsMobileLayout(window.innerWidth < 768);
    updateLayout();
    window.addEventListener("resize", updateLayout);

    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await axios.get("/api/dbhandler?model=portfolio");
        const items = Array.isArray(response.data) ? response.data : [];
        const activeOnly = items.filter((portfolio) => {
          if (!portfolio.activatedAt || !portfolio.activationExpiresAt) return false;
          return new Date(portfolio.activationExpiresAt).getTime() > Date.now();
        });
        setPortfolios(activeOnly);
      } catch (error) {
        console.error("Failed to fetch portfolios", error);
      }
    };

    fetchPortfolios();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Careers</p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">Build the next generation of commerce</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
          Join a team helping businesses launch, manage, and grow digital storefronts with smarter tools and better customer experiences.
        </p>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <BriefcaseBusiness className="mb-4 h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold">Flexible roles</h2>
          <p className="mt-2 text-sm text-muted-foreground">Remote, hybrid, and team-based opportunities for digital commerce support.</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <Building2 className="mb-4 h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold">Startup energy</h2>
          <p className="mt-2 text-sm text-muted-foreground">Work on meaningful projects that help brands launch and grow online.</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <Sparkles className="mb-4 h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold">Growth culture</h2>
          <p className="mt-2 text-sm text-muted-foreground">Learn fast, build products, and contribute to ambitious digital experiences.</p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-black tracking-tight">Active professionals</h2>
        {portfolios.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            No active portfolios are currently available.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {portfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio.id}
                portfolio={portfolio}
                layout={isMobileLayout ? "horizontal" : "vertical"}
                active={true}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {roles.map((role) => (
          <div key={role.title} className="rounded-3xl border border-border bg-muted/30 p-6 shadow-sm">
            <div className="mb-3 inline-flex rounded-full bg-primary/10 p-2 text-primary">
              <CircleDashed className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold">{role.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{role.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
        <h2 className="text-2xl font-black tracking-tight">Open to new opportunities?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Send your interest and resume to the team to explore store operations, customer support, product operations, and growth roles.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          Contact us <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
