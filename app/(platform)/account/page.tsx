"use client"
import React, { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Signup } from "@/components/myComponents/subs"
import EditUser from "@/components/myComponents/subs/useredit"
import dynamic from 'next/dynamic'
const Login = dynamic(() => import('@/components/myComponents/subs').then((e) => e.Login), { ssr: false })
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useAppContext } from "@/hooks/useAppContext"
import { ProfileImg } from "@/components/myComponents/subs/fileupload"
import { signOut } from "next-auth/react"
import UserShippingAddressForm from "@/prisma/forms/userShippingAddressForm"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import Papa from "papaparse"
import { cn } from "@/lib/utils"
import { AdminUserManager } from "@/components/myComponents/subs/AdminUserManager"
import { AdminBulkManager } from "@/components/myComponents/subs/AdminBulkManager"
import { AffiliateDialog } from "@/components/myComponents/subs/AffiliateDialog"
import { PortfolioCard } from "@/components/myComponents/subs/PortfolioCard"
import { ProfileSkeleton, TableSkeleton } from "@/components/skeletons"
import MonnifyPaymentButton from "@/components/payment/monnify"
import { ManualTransfer } from "@/components/payment/manual"
import { getBrowserLocation, getSavedUserLocation, saveUserLocation, type UserLocation } from "@/lib/user-location"
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Heart,
  LogOut,
  Shield,
  Building,
  Clock,
  Briefcase,
  Building2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Plus,
  Database,
  LayoutGrid,
  LayoutList,
  Users,
  Copy,
  Download,
  Loader2,
  Upload
} from "lucide-react"

const STORE_PLAN_CATALOG = [
  {
    id: "basic",
    name: "Basic",
    price: 500,
    first3MonthsFree: true,
    productLimit: 15,
    highlight: "For starting businesses",
    features: [
      "3 months free on activation",
      "Max 15 products",
      "N500/month",
      "AI purchase disabled",
      "Add products from new products only; not a whole category",
      "Category add from new product page is allowed, but not all category products",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 5000,
    first3MonthsPrice: 3000,
    productLimit: 200,
    highlight: "For fast-growing stores",
    features: [
      "N3,000 for first 3 months",
      "N5,000/month after that",
      "Gmail purchase notifications",
      "Up to 200 products",
      "Add a category and all its products, or pick selected items from a category",
      "Customer AI purchase access",
      "Featured on platform home and store page",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    price: 100000,
    priceRange: "₦100,000 - ₦800,000",
    productLimit: Infinity,
    highlight: "Built for large businesses",
    features: [
      "Your personal website",
      "Your own domain name",
      "Dedicated database",
      "Free servicing for the first year",
      "Free upgrade proposal for the first 3 months",
      "Everything in Premium, including AI",
    ],
  },
] as const;

const getPlanById = (planId: string) => STORE_PLAN_CATALOG.find((plan) => plan.id === planId) || STORE_PLAN_CATALOG[0];

const getPlanMultiplier = (planId: string, count: number, unit: "month" | "year") => {
  if (planId === "custom") return count * 100000;
  const monthMultiplier = unit === "year" ? 12 : 1;
  const basePrice = planId === "premium" ? 5000 : 500;
  const first3MonthsPrice = planId === "premium" ? 3000 : 0;
  const months = count * monthMultiplier;
  if (planId === "basic") return months * basePrice;
  if (planId === "premium") {
    if (months <= 3) return first3MonthsPrice;
    return Math.max(0, months - 3) * basePrice + first3MonthsPrice;
  }
  return basePrice;
};

const getCountdownParts = (expiresAt: Date | null) => {
  if (!expiresAt) return { years: 0, months: 0, days: 0 };
  const diffMs = Math.max(0, expiresAt.getTime() - Date.now());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;
  return { years, months, days };
};

const Account = () => {
  const { user, setUser } = useAppContext()
  const [cardOrientation, setCardOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [showAffiliateLinkDialog, setShowAffiliateLinkDialog] = useState(false);
  const [affiliateLinkInput, setAffiliateLinkInput] = useState("");
  const [loadingAffiliateData, setLoadingAffiliateData] = useState(true);
  const [downloadingDataOps, setDownloadingDataOps] = useState(false);
  const [affiliatePopupSeen, setAffiliatePopupSeen] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [ownedBusinesses, setOwnedBusinesses] = useState<any[]>([]);
  const [planCheckout, setPlanCheckout] = useState<null | { businessId: string; businessName: string; planId: string; amount: number; durationCount: number; durationUnit: "month" | "year" }>(null);
  const [planDurations, setPlanDurations] = useState<Record<string, { count: number; unit: "month" | "year" }>>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const AFFILIATE_ACCOUNT_POPUP_KEY = 'hc_affiliate_account_popup_shown';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";

  useEffect(() => {
    const savedLocation = getSavedUserLocation();
    if (savedLocation) {
      setUserLocation(savedLocation);
      return;
    }
    const timer = window.setTimeout(() => setLocationDialogOpen(true), 10000);
    return () => window.clearTimeout(timer);
  }, []);

  const detectUserLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getBrowserLocation();
      saveUserLocation(location);
      setUserLocation(location);
      setLocationDialogOpen(false);
      toast.success(`Location saved: ${location.label}`);
    } catch {
      toast.error("Could not access your location. Enter your area manually instead.");
    } finally {
      setLocationLoading(false);
    }
  };

  const saveManualLocation = () => {
    const label = manualLocation.trim();
    if (!label) return toast.error("Enter a city, state, or area");
    const location: UserLocation = { label, source: "manual" };
    saveUserLocation(location);
    setUserLocation(location);
    setManualLocation("");
    setLocationDialogOpen(false);
    toast.success(`Location saved: ${label}`);
  };

  useEffect(() => {
    if (!user?.id || user.id === "nil") return;

    const fetchBusinesses = async () => {
      try {
        const response = await axios.get(`/api/dbhandler?model=business&ownerId=${user.id}`);
        const businesses = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
        setOwnedBusinesses(
          businesses.map((business: any) => ({
            ...business,
            template: business.template || "estore",
            plan: business.template === "pharmacy" ? "premium" : (business.plan || "basic"),
            planExpiresAt: business.planExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch business plans", error);
      }
    };

    fetchBusinesses();
  }, [user?.id]);

  useEffect(() => {
    const saved = localStorage.getItem('store-card-orientation');
    if (saved === 'vertical' || saved === 'horizontal') {
      setCardOrientation(saved);
    }
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem(AFFILIATE_ACCOUNT_POPUP_KEY) === 'true';
    setAffiliatePopupSeen(seen);
  }, []);

  useEffect(() => {
    // Check affiliate status from session data
    if (!user || user.email === "nil") {
      setLoadingAffiliateData(false);
      return;
    }

    // Use affiliate status from session instead of API call
    setIsAffiliate(user.isAffiliate || false);
    setAffiliateData(user.affiliate || null);
    setLoadingAffiliateData(false);

    if (!user.isAffiliate && !affiliatePopupSeen) {
      setShowAffiliateLinkDialog(true);
      localStorage.setItem(AFFILIATE_ACCOUNT_POPUP_KEY, 'true');
      setAffiliatePopupSeen(true);
    }
  }, [user?.email, affiliatePopupSeen]);

  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!user?.id || user.id === 'nil') return;
      try {
        setPortfolioLoading(true);
        const res = await axios.get(`/api/dbhandler?model=portfolio&userId=${user.id}`);
        setPortfolios(Array.isArray(res.data) ? res.data : res.data ? [res.data] : []);
      } catch (error) {
        console.error('Failed to fetch portfolios', error);
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchPortfolios();
  }, [user?.id]);

  useEffect(() => {
    if (!isAffiliate) return;

    const fetchReferrals = async () => {
      const res = await fetch('/api/affiliate/referrals');
      const resp = await res.json();
      if (res.ok) setReferrals(resp.referrals || []);
    };

    const fetchPayouts = async () => {
      const res = await fetch('/api/affiliate/payouts');
      const resp = await res.json();
      if (res.ok) setPayouts(resp.payouts || []);
    };

    fetchReferrals();
    fetchPayouts();
  }, [isAffiliate]);

  const toggleOrientation = () => {
    const newOrientation = cardOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    setCardOrientation(newOrientation);
    localStorage.setItem('store-card-orientation', newOrientation);
  };

  const handlePortfolioActivation = async (portfolioId: string) => {
    if (!user?.id || user.id === 'nil') return;

    try {
      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await axios.put(`/api/dbhandler?model=portfolio&id=${portfolioId}`, {
        activatedAt: new Date().toISOString(),
        activationExpiresAt: expiresAt,
      });

      const updated = portfolios.map((item) =>
        item.id === portfolioId
          ? { ...item, activatedAt: new Date().toISOString(), activationExpiresAt: expiresAt }
          : { ...item, activatedAt: null, activationExpiresAt: null }
      );
      setPortfolios(updated);
      toast.success("Portfolio activated successfully.");
    } catch (error) {
      console.error("Activate portfolio failed", error);
      toast.error("Could not activate this portfolio.");
    }
  };

  const handlePlanPurchase = (business: any, planId: string, durationCount: number, durationUnit: "month" | "year") => {
    const selectedPlan = getPlanById(planId);
    const amount = planId === "custom"
      ? Math.min(800000, Math.max(100000, durationCount * (durationUnit === "year" ? 100000 : 100000)))
      : getPlanMultiplier(planId, durationCount, durationUnit);

    setPlanCheckout({
      businessId: business.id,
      businessName: business.name,
      planId,
      amount,
      durationCount,
      durationUnit,
    });

    if (!planId) return;
    toast.success(`${business.name} ready for ${selectedPlan.name} payment.`);
  };

  const finalizeBusinessPlan = (businessId: string, planId: string, durationCount: number, durationUnit: "month" | "year") => {
    const months = durationUnit === "year" ? durationCount * 12 : durationCount;
    const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();

    setOwnedBusinesses((current) => current.map((business) => business.id === businessId ? { ...business, plan: planId, planExpiresAt: expiresAt } : business));
    setPlanCheckout(null);
    toast.success(`Plan updated to ${getPlanById(planId).name}.`);
  };

  const copyAffiliateId = async () => {
    if (affiliateData?.affiliateId) {
      try {
        await navigator.clipboard.writeText(affiliateData.affiliateId);
        toast.success("Affiliate ID copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy affiliate ID");
      }
    }
  };

  const copyAffiliateLink = async () => {
    if (affiliateData?.affiliateId) {
      const link = `${appUrl}?affiliate=${affiliateData.affiliateId}`;
      try {
        await navigator.clipboard.writeText(link);
        toast.success("Affiliate link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy affiliate link");
      }
    }
  };

  const applyAffiliateLink = async () => {
    const match = affiliateLinkInput.trim().match(/affiliate=([A-Z0-9_-]+)/i);
    if (!match) {
      toast.error("Enter a valid affiliate link");
      return;
    }

    const affiliateId = match[1];
    localStorage.setItem('healthclique_affiliate_referral', JSON.stringify({ affiliateId, timestamp: Date.now(), source: 'manual' }));
    toast.success('Affiliate link applied for your next purchase.');
    setShowAffiliateLinkDialog(false);
  };

  const downloadAllDatabaseObjects = async () => {
    try {
      setDownloadingDataOps(true);
      
      // Fetch products data
      const res = await axios.get(`/api/sheet?model=product&limit=2000&details=true`);
      const products = res.data.data || [];
      
      if (!products.length) {
        toast.error("No products to export");
        return;
      }

      // Column order for products CSV
      const columnOrder = ["name", "category", "brand", "vendor", "price", "stock", "numberPcs", "form", "image", "bulkName", "bulkQty", "bulkPrice", "scarce", "requiresPrescription"];
      const columnLabels: Record<string, string> = {
        name: "Name",
        category: "Category",
        brand: "Brand",
        vendor: "Vendor",
        price: "Cost Price",
        stock: "In Stock",
        numberPcs: "Pack Size",
        form: "Form",
        image: "Product Image",
        scarce: "Scarce",
        requiresPrescription: "Rx Req",
        bulkName: "Bulk Name",
        bulkQty: "Unit Qty",
        bulkPrice: "Bulk Price"
      };

      // Process products data
      const csvData = products.map((row: any) => {
        const flatRow: any = { id: row.id };
        columnOrder.forEach(field => {
          let value = row[field];
          if (field === 'vendor') {
            const defaultVendor = row.vendors?.find((v: any) => v.isDefault);
            value = defaultVendor ? defaultVendor.vendor?.name : (row.vendors?.[0]?.vendor?.name || '');
          } else if (field === 'category') {
            value = row.category?.name || '';
          } else if (field === 'brand') {
            value = row.brand?.name || '';
            // Ensure empty string if brand is null/undefined
            if (!value || value === 'brand' || (typeof value === 'string' && !value.trim())) {
              value = '';
            }
          } else if (field === 'stock') {
            value = row.stock?.reduce((acc: number, s: any) => acc + s.addedQuantity, 0) || 0;
          } else if (field === 'image') {
            // Create Excel IMAGE formula for direct image display
            const imageUrl = row.image || '';
            if (imageUrl && imageUrl.trim()) {
              value = `=IMAGE("${imageUrl}","Product Image",80,60)`;
            } else {
              value = '';
            }
          } else if (field === 'bulkName') {
            value = row.bulkPrices?.[0]?.name || '';
          } else if (field === 'bulkQty') {
            value = row.bulkPrices?.[0]?.quantity || '';
          } else if (field === 'bulkPrice') {
            value = typeof row.bulkPrices?.[0]?.price === 'number' ? row.bulkPrices[0].price.toFixed(3) : '';
          } else if (field === 'price' && typeof value === 'number') {
            value = value.toFixed(3);
          }
          flatRow[columnLabels[field] || field] = value ?? "";
        });
        return flatRow;
      });

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products_export_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Products CSV exported successfully!");
    } catch (err) {
      toast.error("Failed to export products CSV");
      console.error(err);
    } finally {
      setDownloadingDataOps(false);
    }
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        let successCount = 0;
        let errorCount = 0;

        // Column labels mapping
        const columnLabels: Record<string, string> = {
          name: "Name",
          category: "Category",
          brand: "Brand",
          vendor: "Vendor",
          price: "Cost Price",
          stock: "In Stock",
          numberPcs: "Pack Size",
          form: "Form",
          image: "Product Image",
          scarce: "Scarce",
          requiresPrescription: "Rx Req",
          bulkName: "Bulk Name",
          bulkQty: "Unit Qty",
          bulkPrice: "Bulk Price"
        };
        
        // Reverse mapping from label to field
        const labelToField: Record<string, string> = {};
        Object.entries(columnLabels).forEach(([field, label]) => {
          labelToField[label] = field;
        });

        for (const row of rows) {
          try {
            const id = row.id || row.ID || row._id;
            if (!id) continue;

            const updateData: Record<string, any> = {};
            let hasChanges = false;

            Object.entries(row).forEach(([label, value]: [string, any]) => {
              if (label.toLowerCase() === 'id' || !value) return;
              
              // Skip image formulas - they're display-only
              if (label === 'Product Image' || (typeof value === 'string' && value.startsWith('=IMAGE'))) {
                return;
              }

              // Map label to field name
              const field = labelToField[label] || label;
              
              // Process value
              let processedValue = value;
              if (value === "true") processedValue = true;
              else if (value === "false") processedValue = false;
              else if (!isNaN(value) && value !== "") processedValue = parseFloat(value);

              if (processedValue !== "") {
                updateData[field] = processedValue;
                hasChanges = true;
              }
            });

            // If there are changes, update the product
            if (hasChanges) {
              try {
                await axios.put(`/api/dbhandler?model=product&id=${id}`, updateData);
                successCount++;
              } catch (err) {
                console.error(`Failed to update product ${id}:`, err);
                errorCount++;
              }
            }
          } catch (err) {
            console.error("Error processing row:", err);
            errorCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`Imported ${successCount} products successfully${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        } else if (errorCount > 0) {
          toast.error(`Failed to import. Errors: ${errorCount}`);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (err) => {
        toast.error("CSV Parse Error: " + err.message);
      }
    });
  }

  if (user.name === "visitor" && user.email === "nil") {
    return (
      <div className="min-h-[60vh] w-full flex flex-col justify-center items-center gap-6 px-4">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">You're not signed in</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Sign in to view your profile, orders, wishlist and more.
          </p>
        </div>
        <div className="flex flex-row gap-3">
          <Login />
          <Signup />
        </div>
      </div>
    )
  }

  const avatarSrc =
    user.avatarUrl && user.avatarUrl !== ""
      ? user.avatarUrl
      : user.image && user.image !== ""
        ? user.image
        : "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png"

  const primaryAddress = user.addresses?.[0]

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
      className="w-full min-h-full"
    >
      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

        {/* ── Avatar & Hero ── */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-lg">
              <img src={avatarSrc} alt={user.name || "User"} className="w-full h-full object-cover" />
            </div>
            <ProfileImg />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">{user.name || "—"}</h1>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize text-xs">
                  {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                  {user.role || "customer"}
                </Badge>
                {user.verificationStatus === "verified" && (
                  <Badge variant="outline" className="text-[10px] border-green-500 text-green-600 bg-green-50 py-0 h-5">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {user.verificationStatus === "pending" && (
                  <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600 bg-amber-50 py-0 h-5">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── My Health Wallet (Card) ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
          
          <div className="relative flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">HealthClique Wallet</span>
              </div>
              <CheckCircle className="h-6 w-6 text-indigo-300" />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-tighter text-indigo-200 font-black">Available Balance</p>
              <h2 className="text-4xl font-black">
                {user.walletCurrency || "₦"}
                {(user.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>

            {isAffiliate && affiliateData?.earnings != null && (
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 mt-3">
                <p className="text-xs text-indigo-200 uppercase tracking-widest font-black">Affiliate Earnings</p>
                <p className="text-xl font-bold">
                  {user.walletCurrency || "₦"}
                  {affiliateData.earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-indigo-100">Total earned from referrals</p>
              </div>
            )}

            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-widest text-indigo-200 font-bold">Holder</p>
                <p className="text-xs font-black uppercase tracking-widest">{user.name}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 rounded-lg bg-white/20 border-white/30 hover:bg-white/30 text-[10px] font-black uppercase gap-1"
                    onClick={async () => {
                        const amount = parseFloat(prompt("Enter amount to top up:", "5000") || "0");
                        if (amount > 0) {
                            try {
                                const newBalance = (user.walletBalance || 0) + amount;
                                await axios.put(`/api/dbhandler?model=user&id=${user.id}`, { walletBalance: newBalance });
                                setUser({ ...user, walletBalance: newBalance });
                                toast.success(`₦${amount.toLocaleString()} added to your wallet!`);
                            } catch (err) {
                                toast.error("Top up failed");
                            }
                        }
                    }}
                 >
                    <Plus className="h-3 w-3" /> Top Up
                 </Button>
                 <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30" />
                    <div className="h-8 w-8 rounded-full bg-white/40 backdrop-blur-md border border-white/30" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-sm font-bold">Find businesses near you</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {userLocation ? `Your location: ${userLocation.label}` : "Set your location to help us show nearby businesses first."}
                </p>
              </div>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setLocationDialogOpen(true)}>
              {userLocation ? "Change" : "Set location"}
            </Button>
          </div>
        </div>

        <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Show businesses near you?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Allow location access so the store can show businesses and products closest to your current area first. You can also enter your location manually.</p>
            <div className="space-y-3">
              <Button type="button" className="w-full" onClick={detectUserLocation} disabled={locationLoading}>
                <MapPin className="mr-2 h-4 w-4" /> {locationLoading ? "Detecting location..." : "Use my current location"}
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Separator className="flex-1" /> or <Separator className="flex-1" /></div>
              <Input placeholder="Enter city, state, or area" value={manualLocation} onChange={(event) => setManualLocation(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveManualLocation(); }} />
              <Button type="button" variant="outline" className="w-full" onClick={saveManualLocation}>Save location</Button>
            </div>
          </DialogContent>
        </Dialog>

        {ownedBusinesses.length > 0 && (
          <div className="rounded-xl border bg-card shadow-sm p-4 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">My Stores</h2>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                {ownedBusinesses.length} store{ownedBusinesses.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="space-y-6">
              {ownedBusinesses.map((business: any) => {
                const activePlanId = business.template === "pharmacy" ? "premium" : (business.plan || "basic");
                const activePlan = getPlanById(activePlanId);
                const currentExpiry = business.planExpiresAt ? new Date(business.planExpiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                const countdown = getCountdownParts(currentExpiry);
                const selectedDuration = planDurations[business.id] || { count: 1, unit: "month" };

                return (
                  <div key={business.id} className="rounded-2xl border bg-muted/20 p-4 shadow-sm">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Store</p>
                        <h3 className="text-xl font-black">{business.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="rounded-full border-primary/20 bg-primary/10 text-primary">
                          {business.template === "pharmacy" ? "Pharmacy template" : "E-store template"}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          {activePlan.name} plan
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-3">
                      {STORE_PLAN_CATALOG.map((plan) => {
                        const isCurrent = activePlanId === plan.id || (business.template === "pharmacy" && plan.id === "premium");
                        const amount = plan.id === "custom"
                          ? selectedDuration.unit === "year" ? 100000 * selectedDuration.count : 100000
                          : getPlanMultiplier(plan.id, selectedDuration.count, selectedDuration.unit);

                        return (
                          <div key={plan.id} className={`relative rounded-2xl border p-4 ${isCurrent ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "bg-background"}`}>
                            {isCurrent && (
                              <div className="absolute right-3 top-3 rounded-full bg-primary px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-primary-foreground">Current</div>
                            )}
                            <div className="space-y-3">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{plan.highlight}</p>
                                <h4 className="mt-2 text-2xl font-black">{plan.name}</h4>
                              </div>

                              <div className="rounded-xl border bg-background/60 p-3">
                                <p className="text-xs text-muted-foreground">Price</p>
                                <p className="text-xl font-black">
                                  {plan.id === "custom" ? plan.priceRange : `₦${amount.toLocaleString()}`}
                                </p>
                              </div>

                              <div className="space-y-2 text-sm text-muted-foreground">
                                {plan.features.map((feature) => (
                                  <div key={feature} className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <select
                                  value={`${selectedDuration.count}-${selectedDuration.unit}`}
                                  onChange={(event) => {
                                    const [count, unit] = event.target.value.split("-");
                                    setPlanDurations((previous) => ({ ...previous, [business.id]: { count: Number(count), unit: unit as "month" | "year" } }));
                                  }}
                                  className="h-10 flex-1 rounded-md border bg-background px-2 text-sm"
                                >
                                  <option value="1-month">1 month</option>
                                  <option value="3-month">3 months</option>
                                  <option value="6-month">6 months</option>
                                  <option value="1-year">1 year</option>
                                  <option value="2-year">2 years</option>
                                </select>
                              </div>

                              {isCurrent && (
                                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-2 text-[11px] font-semibold text-primary">
                                  Current plan expiry: {countdown.years}y {countdown.months}m {countdown.days}d
                                </div>
                              )}

                              <Button
                                type="button"
                                onClick={() => handlePlanPurchase(business, plan.id, selectedDuration.count, selectedDuration.unit)}
                                className="w-full"
                                variant={isCurrent ? "secondary" : "default"}
                              >
                                {isCurrent ? "Manage plan" : "Pay now"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-xl border bg-card shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">My Portfolios</h2>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
              {portfolios.length}/3
            </Badge>
          </div>

          {portfolioLoading ? (
            <div className="text-sm text-muted-foreground">Loading portfolios...</div>
          ) : portfolios.length === 0 ? (
            <div className="text-sm text-muted-foreground">No portfolios created yet.</div>
          ) : (
            <div className="space-y-4">
              {portfolios.map((portfolio) => {
                const activatedAt = portfolio.activatedAt ? new Date(portfolio.activatedAt) : null;
                const expiresAt = portfolio.activationExpiresAt ? new Date(portfolio.activationExpiresAt) : null;
                const active = Boolean(activatedAt && expiresAt && expiresAt.getTime() > Date.now());

                return (
                  <div key={portfolio.id} className="space-y-2">
                    <PortfolioCard
                      portfolio={portfolio}
                      layout="horizontal"
                      active={active}
                      showActivateButton
                      onActivate={handlePortfolioActivation}
                    />
                    <Button
                      type="button"
                      onClick={() => handlePortfolioActivation(portfolio.id)}
                      className={cn(
                        "w-full rounded-full text-xs font-black",
                        active ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                      )}
                    >
                      {active ? "Active until countdown ends" : "Start 2-week activation countdown"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isAffiliate && (
          <div className="rounded-xl border bg-card shadow-sm p-4 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Affiliate Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 border rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground">Referral history</p>
                {referrals.length === 0 ? (
                  <p className="text-xs text-muted-foreground mt-2">No referrals yet</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-xs">
                    {referrals.slice(0, 8).map((r) => (
                      <li key={r.id} className="flex justify-between gap-2 items-center">
                        <span className="truncate">#{r.orderId}</span>
                        <span className="font-medium">{(r.affiliateCommission || 0).toFixed(2)}</span>
                        <Badge variant={r.status === 'paid' ? 'secondary' : 'outline'}>{r.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground">Payouts history</p>
                {payouts.length === 0 ? (
                  <p className="text-xs text-muted-foreground mt-2">No payout requests yet</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-xs">
                    {payouts.slice(0, 8).map((p) => (
                      <li key={p.id} className="flex justify-between gap-2 items-center">
                        <span>₦{p.amount.toFixed(2)}</span>
                        <Badge variant={p.status === 'paid' ? 'secondary' : 'outline'}>{p.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin: full user manager. Staff: nothing. Customer/Professional/Wholesaler: upgrade prompt */}
        {user.role === "admin" ? (
          <>
            <AdminBulkManager />
            <AdminUserManager />
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-muted/40 border-b">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Admin Tools</h2>
              </div>
              <div className="p-5 space-y-3">
                <Link href="/sheet">
                  <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                    <Database className="h-4 w-4" />
                    Data Sheet Manager
                  </Button>
                </Link>
                <Button 
                  onClick={downloadAllDatabaseObjects}
                  disabled={downloadingDataOps}
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  {downloadingDataOps ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download Products CSV
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  <Upload className="h-4 w-4" />
                  Upload Products CSV
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".csv"
                  title="import-csv"
                  onChange={handleImportCSV} 
                />
              </div>
            </div>
          </>
        ) : null}

        <Separator />

        {/* ── Profile Info Card ── */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-muted/40 border-b">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profile Information</h2>
          </div>

          <div className="divide-y">
            {/* Email */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{user.email || "—"}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="text-sm font-medium">{user.contact || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Professional Details (If any) ── */}
        {user.role === "professional" && (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden border-primary/20">
            <div className="px-5 py-3 bg-primary/10 border-b flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Professional Details</h2>
            </div>
            <div className="divide-y">
              <div className="px-5 py-3 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Specialization</span>
                <span className="font-medium capitalize">{user.professionalType || "—"}</span>
              </div>
              <div className="px-5 py-3 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Reg Number</span>
                <span className="font-medium">{user.regNumber || "—"}</span>
              </div>
              {user.licenseImage && (
                <div className="px-5 py-3 flex flex-col gap-2">
                  <span className="text-muted-foreground text-sm font-medium">Practice License</span>
                  <div className="w-full aspect-video rounded-lg overflow-hidden border">
                    <img src={user.licenseImage} alt="License" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Wholesaler Details (If any) ── */}
        {user.role === "wholesaler" && (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden border-primary/20">
            <div className="px-5 py-3 bg-primary/10 border-b flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Facility Details</h2>
            </div>
            <div className="divide-y">
              <div className="px-5 py-4 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Facility Name</span>
                <span className="text-sm font-medium">{user.facilityName || "—"}</span>
              </div>
              <div className="px-5 py-4 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Address</span>
                <span className="text-sm font-medium">{user.facilityAddress || "—"}</span>
              </div>
              <div className="px-5 py-3 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Registration No</span>
                <span className="font-medium">{user.facilityRegNumber || "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Shipping Address Card ── */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-muted/40 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Shipping Address</h2>
            <EditUser />
          </div>

          {primaryAddress ? (
            <div className="divide-y">
              <div className="flex items-start gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Primary Address</p>
                  <p className="text-sm font-medium">
                    {[primaryAddress.address, primaryAddress.city, primaryAddress.state, primaryAddress.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {primaryAddress.zip && (
                    <p className="text-xs text-muted-foreground mt-0.5">ZIP: {primaryAddress.zip}</p>
                  )}
                  {primaryAddress.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5">📞 {primaryAddress.phone}</p>
                  )}
                </div>
              </div>

              {/* Additional addresses */}
              {user.addresses && user.addresses.length > 1 && user.addresses.slice(1).map((addr: any, i: number) => (
                <div key={addr.id || i} className="flex items-start gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Address {i + 2}</p>
                    <p className="text-sm font-medium">
                      {[addr.address, addr.city, addr.state, addr.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No shipping address added yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Edit your profile to add one</p>
            </div>
          )}
        </div>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/wishlist">
            <div className="rounded-xl border bg-card shadow-sm p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Wishlist</p>
                <p className="text-xs text-muted-foreground">Saved items</p>
              </div>
            </div>
          </Link>

          <Link href="/orders">
            <div className="rounded-xl border bg-card shadow-sm p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Orders</p>
                <p className="text-xs text-muted-foreground">Purchase history</p>
              </div>
            </div>
          </Link>

          {isAffiliate ? (
            <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Affiliate ID</p>
                  <p className="text-xs text-muted-foreground font-mono">{affiliateData?.affiliateId}</p>
                  <p className="text-xs text-muted-foreground mt-1">Name: {affiliateData?.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={copyAffiliateId}>Copy ID</Button>
                  <Button variant="secondary" size="sm" onClick={copyAffiliateLink}>Copy Link</Button>
                </div>
              </div>

              <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-xs">
                <p className="font-medium text-green-700">Affiliate link:</p>
                <p className="break-all text-sm">{`${appUrl}?affiliate=${affiliateData?.affiliateId}`}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold">Referral performance</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="rounded-lg border bg-white p-2">
                    <p className="text-xs text-muted-foreground">Total referrals</p>
                    <p className="text-lg font-bold">{referrals.length}</p>
                  </div>
                  <div className="rounded-lg border bg-white p-2">
                    <p className="text-xs text-muted-foreground">Total payouts</p>
                    <p className="text-lg font-bold">{payouts.reduce((sum,e) => sum + e.amount, 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <AffiliateDialog
              onSuccess={async () => {
                try {
                  // Since user just became an affiliate, we need to refresh session data
                  // For now, we'll make a minimal API call to get updated affiliate data
                  const res = await fetch("/api/affiliate");
                  const data = await res.json();
                  setIsAffiliate(data.isAffiliate);
                  setAffiliateData(data.affiliate);
                  toast.success("Affiliate program activated!");
                } catch (err) {
                  console.error(err);
                  toast.error("Could not fetch affiliate details");
                }
              }}
              trigger={
                <div className="rounded-xl border bg-card shadow-sm p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Affiliate Program</p>
                    <p className="text-xs text-muted-foreground">Earn commissions</p>
                  </div>
                </div>
              }
            />
          )}

          <Dialog open={showAffiliateLinkDialog} onOpenChange={setShowAffiliateLinkDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Enter Affiliate Link (for bonus)</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <input
                  className="w-full rounded-lg border p-2"
                  placeholder="https://yourapp.com?affiliate=AFF12345"
                  value={affiliateLinkInput}
                  onChange={(e) => setAffiliateLinkInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Use a valid affiliate URL to get a 1.5% wallet bonus on next purchase.</p>
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setShowAffiliateLinkDialog(false)}>Skip</Button>
                <Button onClick={applyAffiliateLink}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-row gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleOrientation}
            title={`Switch to ${cardOrientation === 'horizontal' ? 'vertical' : 'horizontal'} layout`}
            className="border-2"
          >
            {cardOrientation === 'horizontal' ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
          <Button
            className="flex-1 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
            variant="outline"
            onClick={async () => {
              try {
                await signOut({ redirect: false });
              } catch (e) {
                console.error("Sign out error", e);
              }
              setUser({
                name: "visitor",
                id: "nil",
                email: "nil",
                avatarUrl: "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png",
                role: "customer",
                contact: "xxxx",
                walletBalance: 0,
                walletCurrency: "₦",
              });
              window.location.href = window.location.origin;
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <EditUser />
        </div>

      </div>

      {planCheckout && (
        <Dialog open={!!planCheckout} onOpenChange={(open) => !open && setPlanCheckout(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upgrade {planCheckout.businessName}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-primary/5 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Selected plan</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xl font-black">{getPlanById(planCheckout.planId).name}</span>
                  <span className="text-xl font-black text-primary">₦{planCheckout.amount.toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{planCheckout.durationCount} {planCheckout.durationUnit}{planCheckout.durationCount > 1 ? "s" : ""}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MonnifyPaymentButton
                  amount={planCheckout.amount}
                  email={user.email || "owner@healthclique.ng"}
                  name={user.name || "Business Owner"}
                  reference={`store-plan-${planCheckout.businessId}-${Date.now()}`}
                  onSuccess={() => finalizeBusinessPlan(planCheckout.businessId, planCheckout.planId, planCheckout.durationCount, planCheckout.durationUnit)}
                  onFailure={() => toast.error("Monnify payment was not completed.")}
                />
                <ManualTransfer
                  tx_ref={`store-plan-${planCheckout.businessId}-${Date.now()}`}
                  amount={planCheckout.amount}
                  cartId={`store-plan-${planCheckout.businessId}`}
                  userId={user.id || "guest"}
                  guestDetails={{ name: user.name || "Business Owner", email: user.email || "owner@healthclique.ng" }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.section>
  )
}

export default Account
