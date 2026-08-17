import Link from "next/link";
import { ArrowRight, Briefcase, Clock3, MapPin, Sparkles } from "lucide-react";

const roles = [
  {
    title: "Store Operations Associate",
    description: "Help manage product updates, customer support, and storefront performance for growing online stores.",
    icon: Briefcase,
  },
  {
    title: "Content & Marketing Specialist",
    description: "Create campaigns, update product stories, and improve digital visibility across social and web channels.",
    icon: Sparkles,
  },
  {
    title: "Customer Experience Representative",
    description: "Support shoppers, answer product questions, and maintain a smooth ordering experience for our customers.",
    icon: Clock3,
  },
];

export default function JobsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Careers</p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">Join our growing team</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
          We are building modern commerce experiences and looking for people who enjoy helping brands grow, serve customers, and deliver excellent digital experiences.
        </p>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {roles.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mb-3 text-xl font-bold">{title}</h2>
            <p className="text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-muted/30 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">Work with us</p>
            <h2 className="text-2xl font-black tracking-tight">We’d love to hear from you.</h2>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Remote-friendly and collaborative
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            Apply Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
