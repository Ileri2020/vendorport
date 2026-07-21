"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 25, stiffness: 10 });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  { value: 500, suffix: "+", label: "Active Stores" },
  { value: 20000, suffix: "+", label: "Sales Generated", prefix: "$" },
  { value: 150, suffix: "+", label: "Templates" },
  { value: 0, suffix: "/7", label: "Expert Support", static: "24" },
];

export default function StatsSection() {
  return (
    <section className="w-full border-y bg-muted/20 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-3 md:px-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 4, delay: i * 0.5 }}
            className="text-center group p-5 rounded-md border-2 border-primary/30 shadow-md shadow-accent/70 my-3"
          >
            <h3 className="text-4xl font-black group-hover:text-accent transition-colors">
              {stat.prefix}
              {stat.static ? (
                stat.static + stat.suffix
              ) : (
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              )}
            </h3>
            <p className="text-sm font-bold text-muted-foreground uppercase opacity-60">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
