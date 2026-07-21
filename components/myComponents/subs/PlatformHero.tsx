"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Login from "@/components/myComponents/subs/login";

export default function PlatformHero({ user }: any) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="w-full py-24 px-4 flex-col items-center text-center bg-gradient-to-b from-accent/15 via-background to-background relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
      </div>

      {/* Rocket */}
      <motion.div
        initial={{ x: "-20vw", y: "120vh", rotate: -20, opacity: 0 }}
        animate={isInView ? {
          x: "120vw",
          y: "-120vh",
          rotate: 25,
          opacity: [0, 1, 1, 0]
        } : {}}
        transition={{
          duration: 2.5,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.5
        }}
        className="absolute text-6xl z-0 pointer-events-none"
      >
        🚀
      </motion.div>

      {/* Trail effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: [0, 0.4, 0] } : {}}
        transition={{ duration: 2.5, delay: 0.5 }}
        className="absolute w-32 h-[400px] bg-gradient-to-t from-accent/40 to-transparent blur-xl rotate-[-45deg] z-0 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl space-y-8 z-10"
      >
        <div className="inline-flex items-center rounded-full border-2 px-4 py-1.5 text-sm font-black bg-primary/10 text-primary border-primary/20 animate-pulse">
          <Zap className="mr-2 h-4 w-4 fill-primary" /> VendorPort v2.0 is Live
        </div>
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-none">
          Scale Your Business <br />
          <span className="text-accent underline decoration-primary/30 italic text-4xl">Without Boundaries</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
          World's most dynamic website builder for entrepreneurs. Launch your e-store, pharmacy, or service site in under 60 seconds with full multi-currency and AI-powered shopping.
        </p>

        <div className="flex flex-col gap-6 justify-center pt-10">
          {user?.email === "nil" ? (
            <div className="flex flex-col gap-3">
              <Login />
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Register to build your site</p>
            </div>
          ) : (
            <Link href="/create-store">
              <Button size="lg" className="py-4 px-10 bg-accent/70 hover:bg-accent/50 text-white font-black animate-pulse text-lg w-full max-w-[300px] rounded-2xl shadow-2xl border-2 shadow-accent/70 transition-all hover:scale-105">
                Launch My Website <PlusCircle className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          )}

          <Link href="#businesses">
            <Button size="lg" variant="outline" className="h-16 px-10 font-black text-xl w-full max-w-sm sm:w-auto rounded-2xl border-2 border-accent hover:bg-muted/50 transition-all bg-accent/15">
              Explore Best Stores <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
