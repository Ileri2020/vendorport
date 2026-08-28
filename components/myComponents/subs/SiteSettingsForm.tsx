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
import { prepareImageForUpload } from "@/lib/compress-image";
import { saveBusinessColorOverrides } from "@/lib/business-colors";

const SiteSettingsForm: React.FC = () => {
  const { currentBusiness, setCurrentBusiness } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [openSection, setOpenSection] = useState<string | null>("hero");
  const [focusedColorKey, setFocusedColorKey] = useState("accentDark");
  const [triangleSelections, setTriangleSelections] = useState<Record<string, { x: number; y: number }>>({});
  const [newOperatingState, setNewOperatingState] = useState("");
  const [newOperatingCountry, setNewOperatingCountry] = useState("Nigeria");

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
    handleChange(focusedColorKey, hsl);
    if (currentBusiness?.id) {
      saveBusinessColorOverrides(String(currentBusiness.id), {
        ...form,
        [focusedColorKey]: hsl,
      });
    }
  };

  const focusedColor = valOf(focusedColorKey, focusedColorKey.includes("Foreground") ? "222 47% 12%" : "45 93% 62%");
  const focusedHue = Number.parseFloat(focusedColor.split(/\s+/)[0]) || 45;
  const hslToRgb = (hsl: string) => {
    const [hue, saturation, lightness] = hsl.split(/\s+/).map((value) => Number.parseFloat(value) || 0);
    const s = Math.max(0, Math.min(100, saturation)) / 100;
    const l = Math.max(0, Math.min(100, lightness)) / 100;
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
    const match = l - chroma / 2;
    const [red, green, blue] = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
    return [red + match, green + match, blue + match];
  };

  const rgbToHsl = ([red, green, blue]: number[]) => {
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;
    if (delta) {
      if (max === red) hue = 60 * (((green - blue) / delta) % 6);
      else if (max === green) hue = 60 * ((blue - red) / delta + 2);
      else hue = 60 * ((red - green) / delta + 4);
    }
    if (hue < 0) hue += 360;
    const lightness = (max + min) / 2;
    const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0;
    return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
  };

  const updateFocusedColorFromPoint = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    const leftEdge = y / 2;
    const rightEdge = 1 - y / 2;
    const rectangleX = Math.max(leftEdge, Math.min(rightEdge, (event.clientX - bounds.left) / bounds.width));
    const triangleX = rightEdge === leftEdge ? 0.5 : (rectangleX - leftEdge) / (rightEdge - leftEdge);
    const whiteWeight = y * (1 - triangleX);
    const hueWeight = y * triangleX;
    const hueRgb = hslToRgb(`${focusedHue} 100% 50%`);
    const rgb = hueRgb.map((channel) => whiteWeight + hueWeight * channel);
    setTriangleSelections((selections) => ({ ...selections, [focusedColorKey]: { x: rectangleX, y } }));
    handleAccentSelect(rgbToHsl(rgb));
  };

  const updateFocusedHueFromRing = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const hue = Math.round((angle * 180) / Math.PI + 90 + 360) % 360;
    const colorParts = focusedColor.split(/\s+/);
    handleAccentSelect(`${hue} ${colorParts[1] || "100%"} ${colorParts[2] || "50%"}`);
  };

  const hueHandleAngle = ((focusedHue - 90) * Math.PI) / 180;
  const hueHandlePosition = {
    left: `${50 + Math.cos(hueHandleAngle) * 39}%`,
    top: `${50 + Math.sin(hueHandleAngle) * 39}%`,
  };
  const focusedColorParts = focusedColor.split(/\s+/);
  const focusedSaturation = Math.max(0, Math.min(100, Number.parseFloat(focusedColorParts[1]) || 0));
  const focusedLightness = Math.max(0, Math.min(100, Number.parseFloat(focusedColorParts[2]) || 50));
  const triangleSelection = triangleSelections[focusedColorKey] || {
    x: Math.max(0, Math.min(1, focusedSaturation / 100)),
    y: Math.max(0, Math.min(1, 1 - focusedLightness / 100)),
  };
  const triangleMarkerPosition = {
    left: `${triangleSelection.x * 100}%`,
    top: `${triangleSelection.y * 100}%`,
  };

  const renderColorPicker = () => (
    <div className="mb-4 rounded-lg border border-border/60 bg-background/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <Label>Color selector</Label>
          <p className="text-xs text-muted-foreground">Choose a pure hue, then pick its shade.</p>
        </div>
        <div className="h-10 w-10 rounded-full border-2 border-white shadow" style={{ background: getAccentCss(focusedColor) }} />
      </div>
      <div className="relative mx-auto h-56 w-56">
        <div
          role="slider"
          aria-label={`Choose pure hue for ${focusedColorKey}`}
          tabIndex={0}
          onPointerDown={updateFocusedHueFromRing}
          onPointerMove={(event) => {
            if (event.buttons > 0) updateFocusedHueFromRing(event);
          }}
          className="absolute inset-0 z-10 cursor-crosshair rounded-full border-[22px] border-transparent shadow-inner"
          style={{
            background: "linear-gradient(hsl(var(--background)), hsl(var(--background))) padding-box, conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000) border-box",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-30 left-1/2 top-1/2 h-8 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
          style={{ ...hueHandlePosition, transform: `translate(-50%, -50%) rotate(${focusedHue}deg)` }}
        />
        <div
          role="slider"
          aria-label={`Choose shade for ${focusedColorKey}`}
          tabIndex={0}
          onPointerDown={(event) => {
            event.stopPropagation();
            updateFocusedColorFromPoint(event);
          }}
          onPointerMove={(event) => {
            event.stopPropagation();
            if (event.buttons > 0) updateFocusedColorFromPoint(event);
          }}
          className="absolute left-1/2 top-1/2 z-20 h-32 w-32 -translate-x-1/2 -translate-y-1/2 cursor-crosshair border border-white/80 shadow-lg"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            background: `linear-gradient(to bottom, #000 0%, rgba(0,0,0,0) 100%), linear-gradient(to right, #fff 0%, hsl(${focusedHue} 100% 50%) 100%)`,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2"
          style={triangleMarkerPosition}
        >
          <span className="absolute left-1/2 top-0 h-full w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.65)]" />
          <span className="absolute left-0 top-1/2 h-px w-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.65)]" />
        </span>
      </div>
    </div>
  );

  const addOperatingState = () => {
    const state = newOperatingState.trim();
    const country = newOperatingCountry.trim();
    if (!state || !country) {
      toast.error("Enter a state and country");
      return;
    }
    const location = `${state}, ${country}`;
    const operatingStates = Array.isArray(form.operatingStates) ? form.operatingStates : [];
    if (!operatingStates.some((item: string) => item.toLowerCase() === location.toLowerCase())) {
      handleChange("operatingStates", [...operatingStates, location]);
    }
    setNewOperatingState("");
  };

  const removeOperatingState = (location: string) => {
    handleChange("operatingStates", (Array.isArray(form.operatingStates) ? form.operatingStates : []).filter((item: string) => item !== location));
  };

  const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const preparedFile = await prepareImageForUpload(file, 100 * 1024);
      if (preparedFile.size >= 100 * 1024) {
        event.target.value = "";
        toast.error("Compressed logo is still above 100 KB. Please choose a smaller image.");
        return;
      }

      const uploadData = new FormData();
      uploadData.append("businessId", currentBusiness?.id || "");
      uploadData.append("file", preparedFile);

      const response = await fetch("/api/file/logo", {
        method: "POST",
        body: uploadData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Logo upload failed");
      handleChange("logoImageUrl", result.url);
      event.target.value = "";
      toast.success(`${preparedFile !== file ? "Logo compressed and " : ""}uploaded. Save settings to apply it.`);
    } catch (error) {
      event.target.value = "";
      console.error(error);
      toast.error("Logo upload failed. Please try again.");
    }
  };

  const handleStorefrontFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentBusiness?.id) return;

    try {
      const preparedFile = await prepareImageForUpload(file, 50 * 1024);
      if (preparedFile.size >= 50 * 1024) {
        event.target.value = "";
        toast.error("Compressed storefront image is still above 50 KB. Please choose a smaller image.");
        return;
      }

      const uploadData = new FormData();
      uploadData.append("businessId", currentBusiness.id);
      uploadData.append("file", preparedFile);
      const response = await fetch("/api/file/storefront", { method: "POST", body: uploadData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Storefront image upload failed");
      handleChange("storefrontImageUrl", result.url);
      event.target.value = "";
      toast.success("Storefront image uploaded. Save settings to apply it.");
    } catch (error) {
      event.target.value = "";
      console.error(error);
      toast.error("Storefront image upload failed. Please try again.");
    }
  };

  const saveSettings = async (
    payload: Record<string, any>,
    options?: { isSection?: boolean; sectionKey?: string; sectionLabel?: string }
  ) => {
    if (!currentBusiness?.id) {
      toast.error("Settings could not be saved. Please try again.");
      return null;
    }

    const { isSection = false, sectionKey = "settings", sectionLabel = "Settings" } = options || {};
    if (isSection) setSavingSection(sectionKey);
    else setSaving(true);

    try {
      const res = await fetch(`/api/site-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.error || "Save failed");

      setForm((prev: any) => ({ ...prev, ...result }));
      saveBusinessColorOverrides(String(currentBusiness.id), result);
      toast.success(`${sectionLabel} saved`);
      return result;
    } catch (err) {
      console.error(err);
      toast.error(`${sectionLabel} could not be saved. Please try again.`);
      return null;
    } finally {
      if (isSection) setSavingSection(null);
      else setSaving(false);
    }
  };

  const syncCurrentBusinessSettings = (nextSettings: Record<string, any>) => {
    if (!currentBusiness?.id) return;

    setCurrentBusiness((previous: any) => {
      if (!previous) return previous;

      const nextBusiness = {
        ...previous,
        siteSettings: {
          ...(previous.siteSettings || {}),
          ...nextSettings,
        },
      };

      if (previous.slug) {
        try {
          window.localStorage.setItem(`storefront.business.${previous.slug}`, JSON.stringify(nextBusiness));
        } catch (error) {
          console.warn("Failed to sync cached business logo state", error);
        }
      }

      return nextBusiness;
    });
  };

  const handleSave = async () => {
    const payload = { ...form, businessId: currentBusiness?.id };
    const result = await saveSettings(payload, { sectionLabel: "Site settings" });
    if (result) syncCurrentBusinessSettings(result);
  };

  const handleSaveSection = async (sectionKey: string, sectionLabel: string, keys: string[]) => {
    const payload: Record<string, any> = { businessId: currentBusiness?.id };
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(form, key)) {
        payload[key] = form[key];
      }
    }

    const result = await saveSettings(payload, { isSection: true, sectionKey, sectionLabel });
    if (result) syncCurrentBusinessSettings(result);
  };

  const renderSectionSaveButton = (sectionKey: string, sectionLabel: string, keys: string[]) => (
    <div className="flex justify-end pt-3">
      <Button type="button" onClick={() => handleSaveSection(sectionKey, sectionLabel, keys)} disabled={savingSection === sectionKey}>
        {savingSection === sectionKey ? `Saving ${sectionLabel}...` : `Save ${sectionLabel}`}
      </Button>
    </div>
  );

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
        {/* Branding */}
        <Collapsible open={openSection === "branding"} onOpenChange={(v) => setOpenSection(v ? "branding" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 flex items-center justify-between">
                <span>Branding</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "branding" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-4">
              <div>
                <Label>Store Logo</Label>
                <Input type="file" accept="image/*" onChange={handleLogoFileChange} className="mt-2" />
                <p className="mt-1 text-xs text-muted-foreground">Upload a logo smaller than 100 KB. The browser will compress oversized images before upload.</p>
                {valOf("logoImageUrl", "") ? <div className="mt-3 rounded-md border bg-white/70 p-3"><img src={valOf("logoImageUrl", "")} alt="Store logo preview" className="max-h-20 w-auto object-contain" /></div> : null}
              </div>
              <div>
                <Label>Storefront Image</Label>
                <Input type="file" accept="image/*" onChange={handleStorefrontFileChange} className="mt-2" />
                <p className="mt-1 text-xs text-muted-foreground">Optional image shown on the platform home page and website carousel. It must be smaller than 50 KB, and oversized images are compressed in-browser before upload.</p>
                {valOf("storefrontImageUrl", "") ? <div className="mt-3 h-32 overflow-hidden rounded-md border bg-white/70"><img src={valOf("storefrontImageUrl", "")} alt="Storefront preview" className="h-full w-full object-cover" /></div> : null}
              </div>
              {renderSectionSaveButton("branding", "Branding", ["logoImageUrl", "storefrontImageUrl"])}
            </CollapsibleContent>
          </div>
        </Collapsible>

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
              {renderSectionSaveButton("home", "Home Page", ["badgeText", "preHeroText", "heroHighlight", "promoTitle", "promoBannerText", "animatedTexts"])}
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
              </div>
              {renderSectionSaveButton("hero", "Hero", ["heroTitle", "heroSubtitle", "heroCTA", "heroCTALink", "heroImage"])}
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Pricing */}
        <Collapsible open={openSection === "pricing"} onOpenChange={(v) => setOpenSection(v ? "pricing" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 flex items-center justify-between">
                <span>Product Pricing</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "pricing" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  id="markup-enabled"
                  type="checkbox"
                  checked={Boolean(form.markupEnabled)}
                  onChange={(e) => handleChange("markupEnabled", e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="markup-enabled">Apply markup to new products</Label>
              </div>
              <div>
                <Label htmlFor="markup-percentage">Markup Percentage</Label>
                <Input
                  id="markup-percentage"
                  type="number"
                  min="0"
                  max="1000"
                  step="0.01"
                  value={valOf("markupPercentage", 0)}
                  onChange={(e: any) => handleChange("markupPercentage", Math.max(0, Number(e.target.value) || 0))}
                  disabled={!form.markupEnabled}
                  placeholder="30"
                />
                <p className="mt-1 text-xs text-muted-foreground">When enabled, new product prices use cost price plus this percentage.</p>
              </div>
              {renderSectionSaveButton("pricing", "Product Pricing", ["markupEnabled", "markupPercentage"])}
            </CollapsibleContent>
          </div>
        </Collapsible>

        <Collapsible open={openSection === "locations"} onOpenChange={(v) => setOpenSection(v ? "locations" : null)}>
          <div className="border rounded-md bg-accent/5">
            <CollapsibleTrigger asChild>
              <button className="w-full p-3 text-left font-semibold bg-accent/20 shadow-md shadow-accent/70 flex items-center justify-between">
                <span>Operating Locations</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === "locations" ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-3">
              <p className="text-sm text-muted-foreground">Products from this business are available in the states listed here.</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <div>
                  <Label htmlFor="operating-state">State or region</Label>
                  <Input id="operating-state" value={newOperatingState} onChange={(event) => setNewOperatingState(event.target.value)} placeholder="Lagos" />
                </div>
                <div>
                  <Label htmlFor="operating-country">Country</Label>
                  <Input id="operating-country" value={newOperatingCountry} onChange={(event) => setNewOperatingCountry(event.target.value)} placeholder="Nigeria" />
                </div>
                <Button type="button" onClick={addOperatingState} className="gap-2"><PlusCircle className="h-4 w-4" />Add location</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(form.operatingStates) ? form.operatingStates : []).map((location: string) => (
                  <button key={location} type="button" onClick={() => removeOperatingState(location)} className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-sm hover:border-destructive hover:text-destructive">
                    {location}<Trash2 className="h-3 w-3" />
                  </button>
                ))}
              </div>
              {renderSectionSaveButton("locations", "Operating Locations", ["operatingStates"])}
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
              {renderSectionSaveButton("icon", "Icon", ["iconMode", "iconText", "iconFontSize", "iconFontColor", "iconImageUrl"])}
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
                <div className="md:col-span-2">
                  <Label>Physical Business Location (optional)</Label>
                  <Input value={valOf("physicalLocation", "")} onChange={(e: any) => handleChange("physicalLocation", e.target.value)} placeholder="e.g. 12 Allen Avenue, Ikeja, Lagos, Nigeria" />
                </div>
              </div>
              {renderSectionSaveButton("contact", "Contact", ["contactDesc", "contactEmail", "contactPhone", "address", "physicalLocation"])}
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
              {renderSectionSaveButton("footer", "Footer", ["headerCTA", "footerText", "newsletterTitle", "newsletterText"])}
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
              {renderSectionSaveButton("social", "Social", ["facebook", "instagram", "twitter", "linkedin"])}
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
              {renderSectionSaveButton("bank", "Bank Transfer Details", ["bankName", "accountNumber", "accountName"])}
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
              {renderSectionSaveButton("about", "About Page Content", ["aboutText", "aboutSub", "whoWeAreText", "visionText", "promiseText", "whatWeDoText", "aiSystemText", "integrityText"])}
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
              <div className="flex flex-col space-y-6">

                {/* Light Mode */}
                <div>
                  <h5 className="font-semibold text-sm mb-3">Light Mode</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/80 text-black/70 p-3 rounded border">
                    <div>
                      <Label>Accent Color (HSL)</Label>
                      {focusedColorKey === "accentLight" && renderColorPicker()}
                      <Input 
                        value={valOf("accentLight", "8365 100% 37%")} 
                        onFocus={() => setFocusedColorKey("accentLight")}
                        onChange={(e: any) => {
                          handleChange("accentLight", e.target.value);
                        }}
                        placeholder="e.g., 8365 100% 37%"
                        className="bg-white text-black border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: hue saturation% lightness%</p>
                    </div>
                    <div>
                      <Label>Secondary Accent (HSL)</Label>
                      {focusedColorKey === "accentSecondaryLight" && renderColorPicker()}
                      <Input 
                        value={valOf("accentSecondaryLight", "45 93% 62%")}
                        onFocus={() => setFocusedColorKey("accentSecondaryLight")}
                        onChange={(e: any) => {
                          handleChange("accentSecondaryLight", e.target.value);
                        }}
                        placeholder="e.g., 43 96% 56%"
                        className="bg-white text-black border-gray-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Foreground (HSL)</Label>
                      {focusedColorKey === "accentForegroundLight" && renderColorPicker()}
                      <Input 
                        value={valOf("accentForegroundLight", "222 47% 12%")} 
                        onFocus={() => setFocusedColorKey("accentForegroundLight")}
                        onChange={(e: any) => handleChange("accentForegroundLight", e.target.value)}
                        placeholder="e.g., 222 47% 12%"
                        className="bg-white text-black border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Dark Mode */}
                <div className="order-first">
                  <h5 className="font-semibold text-sm mb-3">Dark Mode</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-800 text-white p-3 rounded border border-gray-700">
                    <div>
                      <Label className="text-white">Accent Color (HSL)</Label>
                      {focusedColorKey === "accentDark" && renderColorPicker()}
                      <Input 
                        value={valOf("accentDark", "8365 100% 59%")} 
                        onFocus={() => setFocusedColorKey("accentDark")}
                        onChange={(e: any) => {
                          handleChange("accentDark", e.target.value);
                        }}
                        placeholder="e.g., 8365 100% 59%"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">Format: hue saturation% lightness%</p>
                    </div>
                    <div>
                      <Label className="text-white">Secondary Accent (HSL)</Label>
                      {focusedColorKey === "accentSecondaryDark" && renderColorPicker()}
                      <Input 
                        value={valOf("accentSecondaryDark", "45 93% 62%")}
                        onFocus={() => setFocusedColorKey("accentSecondaryDark")}
                        onChange={(e: any) => {
                          handleChange("accentSecondaryDark", e.target.value);
                        }}
                        placeholder="e.g., 45 93% 62%"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-white">Foreground (HSL)</Label>
                      {focusedColorKey === "accentForegroundDark" && renderColorPicker()}
                      <Input 
                        value={valOf("accentForegroundDark", "222 47% 10%")} 
                        onFocus={() => setFocusedColorKey("accentForegroundDark")}
                        onChange={(e: any) => handleChange("accentForegroundDark", e.target.value)}
                        placeholder="e.g., 222 47% 10%"
                        className="bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {renderSectionSaveButton("colors", "Colors", ["accentLight", "accentDark", "accentSecondaryLight", "accentSecondaryDark", "accentForegroundLight", "accentForegroundDark"])}
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
