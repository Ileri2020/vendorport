"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, HeartPulse, BrainCircuit, Activity, Pill, Users, Building, MapPin, Truck } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";

import Countup from "react-countup";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const chartData = [
  { name: "Jan", prescriptions: 400 },
  { name: "Feb", prescriptions: 600 },
  { name: "Mar", prescriptions: 1000 },
  { name: "Apr", prescriptions: 1400 },
  { name: "May", prescriptions: 2500 },
  { name: "Jun", prescriptions: 4000 },
  { name: "Jul", prescriptions: 7200 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const About = () => {
  const { currentBusiness } = useAppContext();
  const templateName = (currentBusiness?.template || "estore").toString().toLowerCase();
  const isPharmacy = templateName === "pharmacy";
  const settings = currentBusiness?.siteSettings || {};

  const brandName = currentBusiness?.name || "Healthclique";
  const brandDisplayName = isPharmacy ? `${brandName} Limited` : brandName;

  const aboutSub = settings.aboutSub !== undefined ? settings.aboutSub : (isPharmacy
    ? "We believe that access to safe, effective, and affordable medicines should never be a privilege—it should be a standard. We are a forward-thinking healthcare company dedicated to solving the complex challenges surrounding medicine access in Nigeria and across underserved African communities."
    : "We make it easy to shop trusted health, wellness, and everyday care products online. Our focus is on quality, convenience, and fast delivery for every customer.");

  const whoWeAreText = settings.whoWeAreText !== undefined ? settings.whoWeAreText : (isPharmacy
    ? `${brandName} Limited is owned and managed by licensed Pharmacists with deep expertise in pharmaceutical care, supply chain management, and patient-centered service delivery. We operate in full compliance with all regulatory requirements governing the pharmaceutical sector, ensuring that every product and service we provide meets the highest standards of safety, quality, and authenticity.`
    : `${brandName} is a modern online health marketplace connecting customers to trusted brands, everyday wellness essentials, and fast delivery. We simplify shopping for care products with a clean, reliable, and customer-first experience.`);

  const visionText = settings.visionText !== undefined ? settings.visionText : (isPharmacy
    ? "To become Africa’s most trusted digital healthcare platform, transforming how medicines are accessed and delivered—one community at a time."
    : "To be the preferred digital destination for customers seeking reliable health and wellness products online.");

  const promiseText = settings.promiseText !== undefined ? settings.promiseText : (isPharmacy
    ? `From the moment you place an order to the time it arrives at your doorstep, we are committed to delivering a smooth, secure, and memorable experience. At ${brandName} Limited, your health is not just our business—it is our purpose.`
    : `From browsing to checkout, we are committed to delivering quality products, clear pricing, and a smooth online shopping experience. At ${brandName}, your wellbeing and convenience always come first.`);

  const aiSystemText = settings.aiSystemText !== undefined ? settings.aiSystemText : (isPharmacy
    ? "With our advanced AI-powered system, accessing medications has never been easier. Simply upload your prescription or request, and our intelligent platform handles verification, sourcing, and fulfillment—delivering a seamless, stress-free experience from start to finish."
    : "Our smart platform helps you find the right product fast, compare trusted brands, and complete your order with confidence.");

  const integrityText = settings.integrityText !== undefined ? settings.integrityText : (isPharmacy
    ? "Integrity is the foundation of everything we do. Our mission aligns closely with the Nigerian National Drug Policy."
    : "We make product quality, dependable delivery, and honest pricing the foundation of every order.");

  const introHeading = isPharmacy ? "About Us" : "About Our Store";
  const whoWeAreHeading = isPharmacy ? "Who We Are" : "Who We Are";
  const visionHeading = isPharmacy ? "Our Vision & Promise" : "Our Mission & Promise";
  const visionLabel = isPharmacy ? "Vision" : "Mission";
  const qualityHeading = isPharmacy ? "Commitment to Quality & Integrity" : "Quality, Value & Trust";
  const footerNote = isPharmacy
    ? `${brandDisplayName} — Simplifying access to quality medicines through innovation, integrity, and care.`
    : `${brandDisplayName} — Making everyday shopping simple, fast, and rewarding.`;
  const qualityBullets = isPharmacy
    ? [
        "Medicines are safe, effective, and of the highest quality.",
        "Pricing remains fair and accessible.",
        "Supply chains are secure, transparent, and reliable.",
        "Sourcing highly specialized and extemporaneous medications tailored to patient needs.",
      ]
    : [
        "Products are selected for quality, value, and reliability.",
        "Pricing stays clear, competitive, and customer-friendly.",
        "Fulfillment is fast, transparent, and dependable.",
        "We help customers find the right products with confidence.",
      ];
  const counterStats = isPharmacy
    ? [
        { num: 15400, text: "Prescriptions Filled" },
        { num: 120, text: "Partner Clinics" },
        { num: 50, text: "Expert Pharmacists" },
        { num: 98, text: "Delivery Success Rate (%)" },
      ]
    : [
        { num: 18000, text: "Orders Delivered" },
        { num: 240, text: "Trusted Brands" },
        { num: 5000, text: "Happy Customers" },
        { num: 97, text: "Delivery Success Rate (%)" },
      ];

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 md:px-8">
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={staggerContainer}
        className="max-w-5xl mx-auto space-y-12"
      >
        {/* Header Section */}
        <motion.div variants={fadeUp} className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="text-xl font-semibold text-primary">{introHeading}</div>
          {/* <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            {currentBusiness?.name ? (
              currentBusiness.name
            ) : (
              <>Healthclique <span className="text-primary">Limited</span></>
            )}
          </h1> */}
          <p className="text-lg text-muted-foreground leading-relaxed">
            {aboutSub}
          </p>
        </motion.div>

        {/* Who We Are & Vision Combo */}
        <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
          <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-2xl">{whoWeAreHeading}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              {whoWeAreText}
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <HeartPulse className="h-8 w-8 text-indigo-500 mb-2" />
              <CardTitle className="text-2xl">{visionHeading}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong>{visionLabel}:</strong> {visionText}
              </p>
              <p>
                <strong>Promise:</strong> {promiseText}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ----- COUNTUP STATS SECTION ----- */}
        <motion.div variants={fadeUp} className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {counterStats.map((stat, index) => (
              <div key={index} className="bg-card border rounded-2xl p-6 shadow-sm text-center flex flex-col justify-center items-center hover:shadow-md transition-all">
                <Countup 
                  end={stat.num}
                  duration={4}
                  delay={0.5}
                  separator=","
                  enableScrollSpy={true}
                  scrollSpyDelay={100}
                  scrollSpyOnce={true}
                  className="text-4xl md:text-5xl font-black text-primary mb-2"
                />
                <div className="text-sm font-semibold text-muted-foreground">{stat.text}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <Separator />

        {/* Quality & Integrity */}
        <motion.div variants={fadeUp} className="bg-card border rounded-2xl p-8 shadow-sm">
           <div className="flex flex-col md:flex-row gap-10">
             <div className="md:w-1/3 space-y-4">
               <ShieldCheck className="h-12 w-12 text-primary" />
               <h2 className="text-2xl font-bold">{qualityHeading}</h2>
               <p className="text-muted-foreground text-sm">
                 {integrityText}
               </p>
             </div>
             <div className="md:w-2/3 grid sm:grid-cols-2 gap-4 auto-rows-min">
               {qualityBullets.map((bullet) => (
                 <div key={bullet} className="flex gap-3">
                   <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                   <p className="text-sm">{bullet}</p>
                 </div>
               ))}
             </div>
           </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div variants={fadeUp} className="text-center pt-8 border-t border-primary/10">
           <p className="text-primary font-bold text-lg mb-6">
             {footerNote}
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium">
             <a 
               href="https://www.instagram.com/healthclique_specialties?utm_source=qr" 
               target="_blank"
               rel="noopener"
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
               Follow us on Instagram
             </a>
             
             <a 
               href="mailto:healthcliquespecialties@gmail.com" 
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
               Email Us
             </a>
           </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default About;
