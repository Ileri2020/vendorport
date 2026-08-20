import Link from "next/link";
import { ArrowRight, CheckCircle2, FilePlus2, FolderPlus, Play, Settings2, UserRound } from "lucide-react";

const tutorials = [
  {
    title: "Creating a category",
    description:
      "Organize your catalog by adding a category before you create products. Learn where to find the category form and how to add an image and description.",
    icon: FolderPlus,
    duration: "Category setup",
    videoUrl: "",
    steps: ["Open Admin", "Choose Categories", "Add the name and image", "Save the category"],
  },
  {
    title: "Creating products",
    description:
      "Add products to your catalog with pricing, images, descriptions, stock details, and pharmacy information where applicable.",
    icon: FilePlus2,
    duration: "Product setup",
    videoUrl: "",
    steps: ["Choose a category", "Enter product details", "Add pricing and image", "Create the product"],
  },
  {
    title: "Editing site settings",
    description:
      "Customize your storefront from the admin settings area, including your logo, hero content, contact details, colors, and pricing preferences.",
    icon: Settings2,
    duration: "Store customization",
    videoUrl: "",
    steps: ["Open Site Settings", "Update your branding", "Edit storefront content", "Save your changes"],
  },
  {
    title: "Signing up and signing in",
    description:
      "Create your Vport account, sign in securely, and access the right dashboard for managing your store and account.",
    icon: UserRound,
    duration: "Account access",
    videoUrl: "",
    steps: ["Choose Sign Up", "Create your account", "Verify your details", "Use Sign In to return"],
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

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Help Center</p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">Build and manage your online store</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
          Short walkthroughs for the everyday tasks that keep your Vport store moving.
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

      <div className="grid gap-6 lg:grid-cols-2">
        {tutorials.map(({ title, description, icon: Icon, duration, videoUrl, steps: tutorialSteps }) => (
          <article key={title} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-950">
              {videoUrl ? (
                <video controls className="h-full w-full object-cover" src={videoUrl} preload="metadata" />
              ) : (
                <div className="flex flex-col items-center gap-3 px-6 text-center text-white/80">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Play className="ml-1 h-6 w-6" fill="currentColor" />
                  </div>
                  <p className="text-sm font-semibold">Tutorial video coming soon</p>
                  <p className="text-xs text-white/50">This video slot is ready for the walkthrough.</p>
                </div>
              )}
              <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                {duration}
              </span>
            </div>
            <div className="p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mb-3 text-xl font-bold">{title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{description}</p>
              <ol className="mt-5 grid gap-2 sm:grid-cols-2">
                {tutorialSteps.map((step, index) => (
                  <li key={step} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </article>
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
