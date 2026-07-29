"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useAppContext } from "@/hooks/useAppContext";
import { toast } from "sonner";
import { PlusCircle, Trash2, ChevronDown } from "lucide-react";

const accentColorOptions = [
  { name: "Emerald", hsl: "152 68% 38%" },
  { name: "Sky", hsl: "199 89% 48%" },
  { name: "Violet", hsl: "258 70% 55%" },
  { name: "Rose", hsl: "336 78% 52%" },
  { name: "Amber", hsl: "36 95% 53%" },
  { name: "Cyan", hsl: "188 90% 40%" },
  { name: "Coral", hsl: "6 84% 58%" },
  { name: "Mint", hsl: "164 64% 42%" },
];

const SiteSettingsForm: React.FC = () => {
  const { currentBusiness } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [openSection, setOpenSection] = useState<string | null>("hero");

  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentBusiness?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/site-settings?businessId=${currentBusiness.id}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setForm(data || {});
      } catch (err) {
        console.error(err);
        toast.error("Could not load site settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [currentBusiness?.id]);

  const handleChange = (key: string, value: any) => setForm((s: any) => ({ ...s, [key]: value }));
  const valOf = (key: string, defaultValue: any = "") => form[key] !== undefined ? form[key] : defaultValue;
  const getAccentCss = (value: string) => `hsl(${value})`;

  const handleAccentSelect = (hsl: string) => {
    handleChange("accentLight", hsl);
    handleChange("accentDark", hsl);
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      handleChange("logoImageUrl", result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!currentBusiness?.id) return toast.error("No business selected");
    setSaving(true);
    try {
      const payload = { ...form, businessId: currentBusiness.id };
      const res = await fetch(`/api/site-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setForm(updated);
      toast.success("Site settings saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save site settings");
    } finally {
      setSaving(false);
    }
  };

  if (!currentBusiness?.id) return null;

  return (
    <div className="mt-6 p-4 border rounded-lg bg-secondary/5 w-full m-1 md:max-w-lg xl:max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold">Site Settings</h4>
        <div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Home Page */}
        <Collapsible open={openSection === "home"} onOpenChange={(v) => setOpenSection(v ? "home" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 animate-pulse flex items-center justify-between">
                <span>Home Page</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "home" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Badge Text</Label>
                  <Input value={valOf("badgeText", "NAFDAC Approved Pharmacy")} onChange={(e: any) => handleChange("badgeText", e.target.value)} placeholder="NAFDAC Approved Pharmacy" />
                </div>
                <div>
                  <Label>Pre-Hero Text</Label>
                  <Input value={valOf("preHeroText", "With a click, get your")} onChange={(e: any) => handleChange("preHeroText", e.target.value)} placeholder="With a click, get your" />
                </div>
                <div>
                  <Label>Hero Highlight</Label>
                  <Input value={valOf("heroHighlight", "Premium Medical Supplies")} onChange={(e: any) => handleChange("heroHighlight", e.target.value)} placeholder="Premium Medical Supplies" />
                </div>
                <div className="md:col-span-2">
                  <Label>Promotion Title</Label>
                  <Textarea value={valOf("promoTitle", "Order authentic medications, pharmaceutical products, and medical equipment at the lowest prices, delivered to your doorstep.")} onChange={(e: any) => handleChange("promoTitle", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Promotion Banner Text</Label>
                  <Textarea value={valOf("promoBannerText", "Authentic medical supplies at clearance prices. Limited quantities available — move fast!")} onChange={(e: any) => handleChange("promoBannerText", e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <Label>Animated Texts</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input value={form.__newAnimatedText || ""} onChange={(e: any) => handleChange("__newAnimatedText", e.target.value)} placeholder="Add animated text..." />
                    <Button aria-label="Add animated text" onClick={() => {
                      const val = (form.__newAnimatedText || "").toString().trim();
                      if (!val) return toast.error("Enter text to add");
                      const list = Array.isArray(form.animatedTexts) ? [...form.animatedTexts] : [];
                      list.push(val);
                      handleChange("animatedTexts", list);
                      handleChange("__newAnimatedText", "");
                    }}>
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {(Array.isArray(form.animatedTexts) ? form.animatedTexts : [
                      "Order authentic medications, pharmaceutical products, and medical equipment at the lowest prices, delivered to your doorstep.",
                      "Authentic medical supplies at clearance prices. Limited quantities available — move fast!",
                      "Fast delivery to your doorstep",
                    ]).map((t: string, idx: number) => (
                      <li key={idx} className="flex items-center justify-between bg-white/50 p-2 rounded-md border">
                        <span className="text-sm">{t}</span>
                        <Button variant="ghost" onClick={() => {
                          const list = Array.isArray(form.animatedTexts) ? [...form.animatedTexts] : [];
                          list.splice(idx, 1);
                          handleChange("animatedTexts", list);
                        }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Hero Page */}
        <Collapsible open={openSection === "hero"} onOpenChange={(v) => setOpenSection(v ? "hero" : null)}>
          <div className="border rounded-md  bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 animate-pulse flex items-center justify-between">
                <span>Hero</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "hero" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Hero Title</Label>
                  <Input value={valOf("heroTitle", "Welcome to our store")} onChange={(e: any) => handleChange("heroTitle", e.target.value)} />
                </div>
                <div>
                  <Label>Hero Subtitle</Label>
                  <Input value={valOf("heroSubtitle", "Browse our products and enjoy great deals")} onChange={(e: any) => handleChange("heroSubtitle", e.target.value)} />
                </div>
                <div>
                  <Label>Hero CTA Text</Label>
                  <Input value={valOf("heroCTA", "Shop Now")} onChange={(e: any) => handleChange("heroCTA", e.target.value)} />
                </div>
                <div>
                  <Label>Hero CTA Link</Label>
                  <Input value={valOf("heroCTALink", "/store")} onChange={(e: any) => handleChange("heroCTALink", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Hero Image URL</Label>
                  <Input value={valOf("heroImage", "")} onChange={(e: any) => handleChange("heroImage", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Store Logo</Label>
                  <Input type="file" accept="image/*" onChange={handleLogoFileChange} className="mt-2" />
                  <Input
                    value={valOf("logoImageUrl", "")}
                    onChange={(e: any) => handleChange("logoImageUrl", e.target.value)}
                    placeholder="Or paste a logo image URL"
                    className="mt-2"
                  />
                  {valOf("logoImageUrl", "") ? (
                    <div className="mt-3 rounded-md border bg-white/70 p-3">
                      <img
                        src={valOf("logoImageUrl", "")}
                        alt="Store logo preview"
                        className="max-h-20 w-auto object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Icon */}
        <Collapsible open={openSection === "icon"} onOpenChange={(v) => setOpenSection(v ? "icon" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 animate-pulse flex items-center justify-between">
                <span>Icon</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "icon" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Icon Mode</Label>
                  <Input value={valOf("iconMode", "text")} onChange={(e: any) => handleChange("iconMode", e.target.value)} />
                </div>
                <div>
                  <Label>Icon Text</Label>
                  <Input value={valOf("iconText", "")} onChange={(e: any) => handleChange("iconText", e.target.value)} />
                </div>
                <div>
                  <Label>Icon Font Size</Label>
                  <Input type="number" value={valOf("iconFontSize", 20)} onChange={(e: any) => handleChange("iconFontSize", Number(e.target.value))} />
                </div>
                <div>
                  <Label>Icon Font Color</Label>
                  <Input value={valOf("iconFontColor", "#000000")} onChange={(e: any) => handleChange("iconFontColor", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Icon Image URL</Label>
                  <Input value={valOf("iconImageUrl", "")} onChange={(e: any) => handleChange("iconImageUrl", e.target.value)} />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Contact */}
        <Collapsible open={openSection === "contact"} onOpenChange={(v) => setOpenSection(v ? "contact" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 animate-pulse flex items-center justify-between">
                <span>Contact</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "contact" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label>Contact Description</Label>
                  <Textarea value={valOf("contactDesc", "If you have any questions, inquiries, or would like to hire me, I would love to hear from you. Please feel free to reach out using the contact information provided below:")} onChange={(e: any) => handleChange("contactDesc", e.target.value)} />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input value={valOf("contactEmail", "healthcliquespecialties@gmail.com")} onChange={(e: any) => handleChange("contactEmail", e.target.value)} />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input value={valOf("contactPhone", "(+234) 816 968 4400")} onChange={(e: any) => handleChange("contactPhone", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Textarea value={valOf("address", "22 Akinagbe, Alapere, Ketu, Lagos State")} onChange={(e: any) => handleChange("address", e.target.value)} />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Footer */}
        <Collapsible open={openSection === "footer"} onOpenChange={(v) => setOpenSection(v ? "footer" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 animate-pulse flex items-center justify-between">
                <span>Footer</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "footer" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Header CTA</Label>
                  <Input value={valOf("headerCTA", "Join Now")} onChange={(e: any) => handleChange("headerCTA", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Footer Text</Label>
                  <Textarea value={valOf("footerText", "Your trusted partner in quality products.")} onChange={(e: any) => handleChange("footerText", e.target.value)} />
                </div>
                <div>
                  <Label>Newsletter Title</Label>
                  <Input value={valOf("newsletterTitle", "Join our Newsletter")} onChange={(e: any) => handleChange("newsletterTitle", e.target.value)} />
                </div>
                <div>
                  <Label>Newsletter Text</Label>
                  <Input value={valOf("newsletterText", "Be the first to know about new arrivals and exclusive offers.")} onChange={(e: any) => handleChange("newsletterText", e.target.value)} />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Social */}
        <Collapsible open={openSection === "social"} onOpenChange={(v) => setOpenSection(v ? "social" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 animate-pulse flex items-center justify-between">
                <span>Social</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "social" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Facebook</Label>
                  <Input value={valOf("facebook", "")} onChange={(e: any) => handleChange("facebook", e.target.value)} />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input value={valOf("instagram", "")} onChange={(e: any) => handleChange("instagram", e.target.value)} />
                </div>
                <div>
                  <Label>Twitter</Label>
                  <Input value={valOf("twitter", "")} onChange={(e: any) => handleChange("twitter", e.target.value)} />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input value={valOf("linkedin", "")} onChange={(e: any) => handleChange("linkedin", e.target.value)} />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Bank Transfer Details */}
        <Collapsible open={openSection === "bank"} onOpenChange={(v) => setOpenSection(v ? "bank" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 animate-pulse flex items-center justify-between">
                <span>Bank Transfer Details (For Manual Payments)</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "bank" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Bank Name</Label>
                  <Input value={valOf("bankName", "")} placeholder="e.g. Moniepoint MFB, GTBank" onChange={(e: any) => handleChange("bankName", e.target.value)} />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input value={valOf("accountNumber", "")} placeholder="e.g. 1234567890" onChange={(e: any) => handleChange("accountNumber", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Account Name (Holder's Name)</Label>
                  <Input value={valOf("accountName", "")} placeholder="e.g. HealthClique Limited" onChange={(e: any) => handleChange("accountName", e.target.value)} />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* About */}
        <Collapsible open={openSection === "about"} onOpenChange={(v) => setOpenSection(v ? "about" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 animate-pulse flex items-center justify-between">
                <span>About Page Content</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "about" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-4">
              <div>
                <Label>About Text (Title)</Label>
                <Textarea value={valOf("aboutText", "Write about your business here")} onChange={(e: any) => handleChange("aboutText", e.target.value)} />
              </div>
              <div>
                <Label>About Subtext / Intro Description</Label>
                <Textarea 
                  value={valOf("aboutSub", "We believe that access to safe, effective, and affordable medicines should never be a privilege—it should be a standard. We are a forward-thinking healthcare company dedicated to solving the complex challenges surrounding medicine access in Nigeria and across underserved African communities.")} 
                  placeholder="We believe that access to safe, effective, and affordable medicines should never be a privilege..." 
                  onChange={(e: any) => handleChange("aboutSub", e.target.value)} 
                  rows={4}
                />
              </div>
              <div>
                <Label>Who We Are Section Description</Label>
                <Textarea 
                  value={valOf("whoWeAreText", "Healthclique Limited is owned and managed by licensed Pharmacists with deep expertise in pharmaceutical care, supply chain management, and patient-centered service delivery. We operate in full compliance with all regulatory requirements governing the pharmaceutical sector, ensuring that every product and service we provide meets the highest standards of safety, quality, and authenticity.")} 
                  placeholder="Healthclique Limited is owned and managed by licensed Pharmacists..." 
                  onChange={(e: any) => handleChange("whoWeAreText", e.target.value)} 
                  rows={4}
                />
              </div>
              <div>
                <Label>Our Vision Description</Label>
                <Textarea 
                  value={valOf("visionText", "To become Africa’s most trusted digital healthcare platform, transforming how medicines are accessed and delivered—one community at a time.")} 
                  placeholder="To become Africa’s most trusted digital healthcare platform..." 
                  onChange={(e: any) => handleChange("visionText", e.target.value)} 
                  rows={3}
                />
              </div>
              <div>
                <Label>Our Promise Description</Label>
                <Textarea 
                  value={valOf("promiseText", "From the moment you place an order to the time it arrives at your doorstep, we are committed to delivering a smooth, secure, and memorable experience. At Healthclique Limited, your health is not just our business—it is our purpose.")} 
                  placeholder="From the moment you place an order to the time it arrives at your doorstep..." 
                  onChange={(e: any) => handleChange("promiseText", e.target.value)} 
                  rows={3}
                />
              </div>
              <div>
                <Label>What We Do Section Description</Label>
                <Textarea 
                  value={valOf("whatWeDoText", "We leverage a holistic, technology-driven approach to bridge the gap between patients, healthcare professionals, and essential medicines. Our robust platform is designed to serve:")} 
                  placeholder="We leverage a holistic, technology-driven approach..." 
                  onChange={(e: any) => handleChange("whatWeDoText", e.target.value)} 
                  rows={3}
                />
              </div>
              <div>
                <Label>AI-Powered System Description</Label>
                <Textarea 
                  value={valOf("aiSystemText", "With our advanced AI-powered system, accessing medications has never been easier. Simply upload your prescription or request, and our intelligent platform handles verification, sourcing, and fulfillment—delivering a seamless, stress-free experience from start to finish.")} 
                  placeholder="With our advanced AI-powered system, accessing medications has never been easier..." 
                  onChange={(e: any) => handleChange("aiSystemText", e.target.value)} 
                  rows={4}
                />
              </div>
              <div>
                <Label>Integrity / Commitment Description</Label>
                <Textarea 
                  value={valOf("integrityText", "Integrity is the foundation of everything we do. Our mission aligns closely with the Nigerian National Drug Policy.")} 
                  placeholder="Integrity is the foundation of everything we do..." 
                  onChange={(e: any) => handleChange("integrityText", e.target.value)} 
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Colors */}
        <Collapsible open={openSection === "colors"} onOpenChange={(v) => setOpenSection(v ? "colors" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 animate-pulse flex items-center justify-between">
                <span>Colors</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "colors" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3">
              <div className="space-y-6">
                <div className="rounded-lg border border-border/60 bg-background/70 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <Label>Accent Preview</Label>
                      <p className="text-xs text-muted-foreground">Tap a triangle to change the store accent.</p>
                    </div>
                    <div
                      className="h-12 w-12 rounded-full border-4 border-white shadow-lg"
                      style={{ background: getAccentCss(valOf("accentLight", "8365 100% 37%")) }}
                    />
                  </div>

                  <div className="mx-auto flex items-center justify-center">
                    <div className="relative h-48 w-48 rounded-full border border-border/60 bg-gradient-to-br from-background to-muted/60 p-4 shadow-inner">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="h-20 w-20 rounded-full border-2 border-white/80 shadow-lg"
                          style={{ background: getAccentCss(valOf("accentLight", "8365 100% 37%")) }}
                        />
                      </div>
                      {accentColorOptions.map((option, index) => {
                        const angle = (index / accentColorOptions.length) * Math.PI * 2 - Math.PI / 2;
                        const x = 50 + Math.cos(angle) * 60;
                        const y = 50 + Math.sin(angle) * 60;
                        return (
                          <button
                            key={option.name}
                            type="button"
                            aria-label={`Select ${option.name} accent`}
                            onClick={() => handleAccentSelect(option.hsl)}
                            className="absolute h-16 w-16 rounded-none border border-white/40 shadow-md transition-transform hover:scale-105"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: "translate(-50%, -50%)",
                              background: getAccentCss(option.hsl),
                              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Light Mode */}
                <div>
                  <h5 className="font-semibold text-sm mb-3">Light Mode</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/80 text-black/70 p-3 rounded border">
                    <div>
                      <Label>Accent Color (HSL)</Label>
                      <Input 
                        value={valOf("accentLight", "8365 100% 37%")} 
                        onChange={(e: any) => handleChange("accentLight", e.target.value)}
                        placeholder="e.g., 8365 100% 37%"
                        className="bg-white text-black border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: hue saturation% lightness%</p>
                    </div>
                    <div>
                      <Label>Secondary Accent (HSL)</Label>
                      <Input 
                        value={valOf("accentSecondaryLight", "199 89% 48%")} 
                        onChange={(e: any) => handleChange("accentSecondaryLight", e.target.value)}
                        placeholder="e.g., 199 89% 48%"
                        className="bg-white text-black border-gray-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Foreground (HSL)</Label>
                      <Input 
                        value={valOf("accentForegroundLight", "222 47% 12%")} 
                        onChange={(e: any) => handleChange("accentForegroundLight", e.target.value)}
                        placeholder="e.g., 222 47% 12%"
                        className="bg-white text-black border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Dark Mode */}
                <div>
                  <h5 className="font-semibold text-sm mb-3">Dark Mode</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-800 text-white p-3 rounded border border-gray-700">
                    <div>
                      <Label className="text-white">Accent Color (HSL)</Label>
                      <Input 
                        value={valOf("accentDark", "8365 100% 59%")} 
                        onChange={(e: any) => handleChange("accentDark", e.target.value)}
                        placeholder="e.g., 8365 100% 59%"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">Format: hue saturation% lightness%</p>
                    </div>
                    <div>
                      <Label className="text-white">Secondary Accent (HSL)</Label>
                      <Input 
                        value={valOf("accentSecondaryDark", "199 89% 66%")} 
                        onChange={(e: any) => handleChange("accentSecondaryDark", e.target.value)}
                        placeholder="e.g., 199 89% 66%"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-white">Foreground (HSL)</Label>
                      <Input 
                        value={valOf("accentForegroundDark", "222 47% 10%")} 
                        onChange={(e: any) => handleChange("accentForegroundDark", e.target.value)}
                        placeholder="e.g., 222 47% 10%"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>

      <Separator className="my-4" />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
      </div>
    </div>
  );
};

export default SiteSettingsForm;
