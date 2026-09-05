import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail, Phone, BriefcaseBusiness, UserRound, Handshake, UserPlus } from "lucide-react";

export interface PortfolioCardProps {
  portfolio: {
    id: string;
    job?: string | null;
    jobDescription?: string | null;
    jobType?: "accepting" | "giving" | null;
    images?: string[];
    contactCount?: number;
    activatedAt?: string | Date | null;
    activationExpiresAt?: string | Date | null;
    user?: {
      id?: string;
      name?: string | null;
      image?: string | null;
    };
  };
  layout?: "vertical" | "horizontal";
  active?: boolean;
  onActivate?: (portfolioId: string) => void;
  showActivateButton?: boolean;
  compact?: boolean;
}

export function PortfolioCard({
  portfolio,
  layout = "vertical",
  active = false,
  onActivate,
  showActivateButton = false,
  compact = false,
}: PortfolioCardProps) {
  const image = portfolio.images?.[0] || process.env.NEXT_PUBLIC_DEFAULT_PORTFOLIO_IMAGE_URL || "/logo.png";
  const statusDate = portfolio.activationExpiresAt ? new Date(portfolio.activationExpiresAt) : null;
  const isExpired = Boolean(statusDate && statusDate.getTime() <= Date.now());
  const badgeTone = active && !isExpired ? "bg-green-500 text-white" : "bg-red-500 text-white";

  const content = (
    <div
      className={cn(
        "group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        layout === "horizontal" ? "flex flex-row" : "flex flex-col",
        compact ? "sm:max-w-none" : ""
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          layout === "horizontal" ? "h-28 w-28 min-w-28" : "h-56 w-full"
        )}
      >
        <img src={image} alt={portfolio.job || "Portfolio image"} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <Badge className={cn("border-none px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]", badgeTone)}>
            {active && !isExpired ? "Active" : "Inactive"}
          </Badge>
          {portfolio.contactCount !== undefined && (
            <Badge variant="secondary" className="bg-white/80 text-foreground backdrop-blur-sm">
              {portfolio.contactCount} contacts
            </Badge>
          )}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5", layout === "horizontal" ? "sm:p-5" : "") }>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                {portfolio.jobType === "giving" ? <Handshake className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                {portfolio.jobType === "giving" ? "Giving jobs" : "Accepting jobs"}
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight">{portfolio.job || "Untitled role"}</h3>
            </div>
          </div>

          <p className="line-clamp-4 text-sm leading-7 text-muted-foreground">
            {portfolio.jobDescription || "No job description added yet."}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {portfolio.user?.name || "User"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              {portfolio.contactCount ?? 0} contact requests
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <Phone className="h-3.5 w-3.5" />
          </div>

          {showActivateButton && onActivate ? (
            <Button
              type="button"
              onClick={() => onActivate(portfolio.id)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-black transition-colors",
                active && !isExpired ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              )}
            >
              {active && !isExpired ? "Activated" : "Activate"}
            </Button>
          ) : (
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground"
            >
              View profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return content;
}
