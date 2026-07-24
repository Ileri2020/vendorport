"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Posts from "@/components/myComponents/subs/posts";
import { PostButton } from "@/components/myComponents/subs/fileupload";
import { useAppContext } from "@/hooks/useAppContext";
import { motion } from "framer-motion";

const BlogPage = () => {
  const { user, currentBusiness } = useAppContext();
  const isAdmin = user?.role === "admin";

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-12 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
          {currentBusiness?.name ? currentBusiness.name : "Store"} <span className="text-primary italic">Updates</span>
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm md:text-base font-medium">
          Media and updates shared by this business for its customers.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/4 space-y-6">
          <div className="bg-muted/30 p-2 rounded-[2.5rem] border border-border/50 sticky top-24">
            {isAdmin && (
              <div className="px-4 py-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">Admin Actions</div>
                <PostButton />
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-3/4">
          <ScrollArea className="h-full pr-4">
            <Posts category="All" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
