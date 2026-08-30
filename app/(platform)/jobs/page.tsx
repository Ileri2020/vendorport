"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Filter, Plus, Search, Users } from "lucide-react";
import { PortfolioCard } from "@/components/myComponents/subs/PortfolioCard";
import PortfolioForm from "@/prisma/forms/PortfolioForm";
import { useAppContext } from "@/hooks/useAppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PAGE_SIZE = 20;
type JobType = "all" | "accepting" | "giving";

export default function JobsPage() {
  const { user } = useAppContext();
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState<JobType>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<"accepting" | "giving">("accepting");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ model: "portfolio", isDefault: "false", limit: String(PAGE_SIZE), offset: String((page - 1) * PAGE_SIZE) });
        if (query) params.set("query", query);
        if (jobType !== "all") params.set("jobType", jobType);
        const response = await axios.get(`/api/dbhandler?${params.toString()}`);
        if (!cancelled) {
          setJobs(Array.isArray(response.data?.data) ? response.data.data : []);
          setTotal(Number(response.data?.total) || 0);
        }
      } catch (error) {
        if (!cancelled) {
          setJobs([]);
          setTotal(0);
          console.error("Failed to fetch jobs", error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchJobs();
    return () => { cancelled = true; };
  }, [jobType, page, query]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isSignedIn = Boolean(user?.id && user.id !== "nil");
  const updateType = (type: JobType) => { setJobType(type); setPage(1); };
  const openCreate = (type: "accepting" | "giving") => { setCreateType(type); setCreateOpen(true); };

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10 pb-28 md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 md:mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Jobs marketplace</p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">Find the right person or opportunity.</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">Browse job profiles posted by users. Search by role, description, or person, then narrow the results by whether someone is accepting work or giving work.</p>
        </header>

        <section className="mb-2 rounded-2xl border bg-card p-2 shadow-sm md:p-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search jobs, skills, descriptions, or names" className="pl-9" /></div>
            <div className="flex flex-column flex-1 flex-wrap items-center gap-2">
                <div className="flex flex-1 gap-2 max-w-sm">
                    <Button type="button" className="flex-1 bg-primary text-background font-semibold" variant={jobType === "accepting" ? "default" : "outline"} onClick={() => updateType("accepting")}>Accepting jobs</Button>
                    <Button className="flex-1 bg-transparent text-primary font-semibold border-2 border-primary" type="button" variant={jobType === "giving" ? "default" : "outline"} onClick={() => updateType("giving")}>Giving jobs</Button>
                </div>
                <div className="flex flex-1 gap-2 max-w-sm justify-center items-center">
                    <Filter className="mr-1 h-6 w-8 mx-4 justify-center items-center text-muted-foreground" />
                    <Button className="flex-1 font-semibold" type="button" variant={jobType === "all" ? "default" : "outline"} onClick={() => updateType("all")}>All jobs</Button>
                </div>
            </div>
          </div>
        </section>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black tracking-tight">Posted job profiles</h2><p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading results..." : `${total.toLocaleString()} active profile${total === 1 ? "" : "s"}`}</p></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /> Showing up to {PAGE_SIZE} per page</div></div>

        {loading ? <div className="grid gap-5 md:grid-cols-2"><div className="h-72 animate-pulse rounded-3xl bg-muted" /><div className="h-72 animate-pulse rounded-3xl bg-muted" /></div> : jobs.length === 0 ? <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center"><BriefcaseBusiness className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-xl font-bold">No matching job profiles</h2><p className="mt-2 text-sm text-muted-foreground">Try another search or switch the job direction filter.</p></div> : <div className="grid gap-5 md:grid-cols-2">{jobs.map((job) => <PortfolioCard key={job.id} portfolio={job} active={true} />)}</div>}

        {totalPages > 1 && <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Jobs pagination"><Button type="button" variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button><span className="text-sm font-semibold">Page {page} of {totalPages}</span><Button type="button" variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button></nav>}
      </div>

      {isSignedIn && <><Button type="button" size="icon" className="fixed bottom-7 right-6 z-40 h-14 w-14 rounded-full shadow-xl md:bottom-9 md:right-9" onClick={() => openCreate("accepting")} aria-label="Create a job profile" title="Create a job profile"><Plus className="h-6 w-6" /></Button><Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl"><DialogHeader><DialogTitle className="text-2xl font-black">Create a job profile</DialogTitle><DialogDescription>Choose whether you are accepting work or giving work, then add the details people need.</DialogDescription></DialogHeader><div className="mb-2 grid grid-cols-2 gap-2"><Button type="button" variant={createType === "accepting" ? "default" : "outline"} onClick={() => setCreateType("accepting")}>Accepting jobs <span className="ml-1 text-xs opacity-70">(max 3)</span></Button><Button type="button" variant={createType === "giving" ? "default" : "outline"} onClick={() => setCreateType("giving")}>Giving jobs <span className="ml-1 text-xs opacity-70">(max 10)</span></Button></div><PortfolioForm key={createType} jobType={createType} allowCreateNew onSubmitted={() => setCreateOpen(false)} /></DialogContent></Dialog></>}
    </main>
  );
}
