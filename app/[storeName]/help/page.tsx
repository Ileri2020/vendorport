import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, LayoutTemplate, Settings, ShoppingBag, Sparkles } from "lucide-react";

const steps = [
  {
    title: "1. Create your website",
    description:
      "Start from the admin area, create your business/store profile, choose your store template, and publish the brand name and landing page that customers will see.",
    icon: LayoutTemplate,
  },
  {
    title: "2. Create categories",
    description:
      "Go to the admin dashboard and open the categories panel. Add product groups such as Vitamins, Personal Care, Healthcare, or Home Essentials so your store is organized before products are uploaded.",
    icon: FileText,
  },
  {
    title: "3. Create products after categories",
    description:
      "Pick a category first, then add each product with its name, price, image, and description. For pharmacy stores, you can also add ingredients, health concerns, brand, and prescription settings.",
    icon: ShoppingBag,
  },
  {
    title: "4. Update website settings",
    description:
      "Open the admin settings page to edit your store name, contact details, hero text, logo, colors, about section, and other storefront content that defines how your website looks and feels.",
    icon: Settings,
  },
  {
    title: "5. Publish and manage content",
    description:
      "Review your store pages, confirm products are displaying correctly, and publish new offers, banners, or updates from the admin dashboard to keep the store fresh and active.",
    icon: Sparkles,
  },
];

const quickTasks = [
  "Create a business/store profile",
  "Add and organize categories",
  "Upload product images and descriptions",
  "Set pricing and bulk pricing",
  "Customize site settings and branding",
  "Launch your storefront for customers",
];

export default function StoreHelpPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Help Center</p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">Build and manage your online store</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
          Follow these simple steps to launch a website, set up product categories, and configure your store settings in the admin dashboard.
        </p>
      </div>

      <div className="mb-12 grid gap-4 md:grid-cols-3">
        {quickTasks.map((task) => (
          <div key={task} className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-4 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{task}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {steps.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mb-3 text-xl font-bold">{title}</h2>
            <p className="text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">Next action</p>
            <h2 className="text-2xl font-black tracking-tight">Ready to start building?</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create-store"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Create Store <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-bold transition hover:bg-muted"
            >
              Open Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
