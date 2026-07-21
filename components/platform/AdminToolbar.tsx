"use client";

/**
 * AdminToolbar — simplified content-only admin panel.
 *
 * REMOVED (architecture migration):
 *  ✗ Pages tab (page creation / deletion)
 *  ✗ Sections tab (add / remove / move sections)
 *  ✗ Drag-and-drop section reordering
 *
 * KEPT (content editing):
 *  ✓ Settings tab  — currency, exchange rate, contact info, socials
 *  ✓ Design tab    — accent colour, font, section padding
 *  ✓ Inventory tab — product management
 *  ✓ Team tab      — staff management
 *  ✓ Posts tab     — blog posts management
 */

import React from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Settings as SettingsIcon,
  Palette,
  Globe,
  Package,
  Users,
  FileText,
  CreditCard,
} from "lucide-react";
import ProductForm from "@/prisma/forms/ProductForm";
// StaffForm not yet implemented
import PostForm from "@/prisma/forms/PostForm";
import { Switch } from "@/components/ui/switch";

const AdminToolbar = ({
  business,
  onUpdateSettings,
  isOpen,
  onOpenChange,
  initialTab = "settings",
  onSectionDataChange,
}: {
  business: any;
  onUpdateSettings: (data: any) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string | null;
  sections?: any[];
  activePage?: any;
  onSectionDataChange?: () => void;
}) => {
  const [currency, setCurrency] = React.useState(business.settings?.currency || "USD");
  const [rate, setRate] = React.useState(business.settings?.exchangeRate?.toString() || "1.0");
  const [facebook, setFacebook] = React.useState(business.siteSettings?.facebook || "");
  const [instagram, setInstagram] = React.useState(business.siteSettings?.instagram || "");
  const [twitter, setTwitter] = React.useState(business.siteSettings?.twitter || "");
  const [linkedin, setLinkedin] = React.useState(business.siteSettings?.linkedin || "");
  const [contactPhone, setContactPhone] = React.useState(business.siteSettings?.contactPhone || "");
  const [contactEmail, setContactEmail] = React.useState(business.siteSettings?.contactEmail || "");
  const [showOutOfStockOverlay, setShowOutOfStockOverlay] = React.useState(
    business.settings?.showOutOfStockOverlay ?? true
  );
  const [primaryColor, setPrimaryColor] = React.useState(
    business.siteSettings?.primaryColor || "#0ea5e9"
  );
  const [secondaryColor, setSecondaryColor] = React.useState(
    business.siteSettings?.secondaryColor || "#f43f5e"
  );
  const [fontFamily, setFontFamily] = React.useState(
    business.settings?.fontFamily || "Inter, sans-serif"
  );
  const [sectionPadding, setSectionPadding] = React.useState(
    business.settings?.sectionPadding || "medium"
  );

  // Tab defaults to "settings" since "pages" no longer exists
  const [activeTab, setActiveTab] = React.useState(
    initialTab === "pages" ? "settings" : (initialTab || "settings")
  );

  React.useEffect(() => {
    const tab = initialTab === "pages" ? "settings" : (initialTab || "settings");
    setActiveTab(tab);
  }, [initialTab]);

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button className="rounded-full h-14 w-14 shadow-2xl bg-black text-white hover:bg-gray-800 transition-all hover:scale-110 border-2 border-white/20">
            <SettingsIcon className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl w-[95vw] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-accent p-6 text-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-xl">
                <SettingsIcon className="h-5 w-5" />
              </div>
              Store Control Center
            </DialogTitle>
            <p className="text-white/70 text-sm mt-1">
              Manage your content, design, and store settings.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 border-b bg-muted/30">
              <TabsList className="bg-transparent h-14 w-full justify-start gap-4 p-0 overflow-x-auto">
                {[
                  { value: "settings", icon: Globe, label: "Settings" },
                  { value: "design",   icon: Palette, label: "Design" },
                  { value: "inventory",icon: Package, label: "Inventory" },
                  { value: "team",     icon: Users, label: "Team" },
                  { value: "posts",    icon: FileText, label: "Posts" },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest shrink-0"
                  >
                    <Icon className="h-4 w-4 mr-2" /> {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">

              {/* ═══ SETTINGS TAB ═══ */}
              <TabsContent value="settings" className="mt-0 space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                        Store Currency
                      </Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="font-black border-2 pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                        Exchange Rate
                      </Label>
                      <Input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        step="0.01"
                        className="font-black border-2 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                        Support Email
                      </Label>
                      <Input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="font-black border-2 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                        Support Phone
                      </Label>
                      <Input
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="font-black border-2 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent">Social Links</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Facebook URL", value: facebook, set: setFacebook },
                        { label: "Instagram URL", value: instagram, set: setInstagram },
                        { label: "Twitter URL",   value: twitter, set: setTwitter },
                        { label: "LinkedIn URL",  value: linkedin, set: setLinkedin },
                      ].map(({ label, value, set }) => (
                        <div key={label} className="space-y-1">
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground">{label}</Label>
                          <Input
                            value={value}
                            onChange={(e) => set(e.target.value)}
                            placeholder="https://..."
                            className="h-10 border-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent">Product Display</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="out-of-stock-overlay"
                        checked={showOutOfStockOverlay}
                        onCheckedChange={setShowOutOfStockOverlay}
                      />
                      <Label htmlFor="out-of-stock-overlay" className="text-sm font-medium">
                        Show Out-of-Stock Overlay on Product Cards
                      </Label>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      onUpdateSettings({
                        currency,
                        exchangeRate: parseFloat(rate),
                        showOutOfStockOverlay,
                        sectionPadding,
                        fontFamily,
                        siteSettings: {
                          facebook,
                          instagram,
                          twitter,
                          linkedin,
                          contactPhone,
                          contactEmail,
                          primaryColor,
                          secondaryColor,
                        },
                      })
                    }
                    className="w-full font-black bg-accent shadow-lg shadow-accent/20 h-12 transition-all hover:scale-[1.01]"
                  >
                    Save All Changes
                  </Button>
                </div>
              </TabsContent>

              {/* ═══ DESIGN TAB ═══ */}
              <TabsContent value="design" className="mt-0 space-y-6">
                <div className="space-y-6">
                  <div className="p-4 bg-muted/10 rounded-2xl border border-muted/30">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent">Theme &amp; Typography</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set global styles — colours, font, and section spacing.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: "Primary Accent Color", value: primaryColor, set: setPrimaryColor },
                      { label: "Secondary Color",      value: secondaryColor, set: setSecondaryColor },
                    ].map(({ label, value, set }) => (
                      <div key={label} className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{label}</Label>
                        <Input type="color" value={value} onChange={(e) => set(e.target.value)} className="h-11 w-20 p-0 border-2" />
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Font Family</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="h-11 border-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Inter, sans-serif","Roboto, sans-serif","Poppins, sans-serif","Montserrat, sans-serif","Georgia, serif"].map((f) => (
                            <SelectItem key={f} value={f}>{f.split(",")[0]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Section Padding</Label>
                      <Select value={sectionPadding} onValueChange={setSectionPadding}>
                        <SelectTrigger className="h-11 border-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["small","medium","large","extra-large"].map((p) => (
                            <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-2xl border p-4 bg-white">
                    <h5 className="uppercase tracking-widest text-xs text-muted-foreground font-black">Preview</h5>
                    <div
                      className="mt-3 p-3 rounded-xl"
                      style={{ background: `linear-gradient(90deg, ${primaryColor}20, ${secondaryColor}20)` }}
                    >
                      <p className="text-sm" style={{ fontFamily }}>
                        This text reflects selected typography and colours.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="mt-0">
                <ProductForm />
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <div className="p-6 text-center text-muted-foreground">
                  <p className="font-medium">Staff management coming soon.</p>
                </div>
              </TabsContent>

              <TabsContent value="posts" className="mt-0">
                <PostForm />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminToolbar;
