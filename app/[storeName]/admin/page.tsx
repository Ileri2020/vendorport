"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DataTableDemo } from "@/components/myComponents/subs/datatable";
import { TableSkeleton } from "@/components/skeletons";

import UserForm from "@/prisma/forms/UserForm";
import ProductForm from "@/prisma/forms/ProductForm";
import CategoryForm from "@/prisma/forms/CategoryForm";
import StockForm from "@/prisma/forms/StockForm";
import FeaturedProductForm from "@/prisma/forms/FeaturedProductForm";
import ReviewForm from "@/prisma/forms/ReviewForm";
import NotificationForm from "@/prisma/forms/NotificationForm";
import PaymentForm from "@/prisma/forms/PaymentForm";
import RefundForm from "@/prisma/forms/RefundForm";
import CartForm from "@/prisma/forms/CartForm";
import CouponForm from "@/prisma/forms/CouponForm";
import ShippingAddressForm from "@/prisma/forms/ShippingAddressForm";
import PostForm from "@/prisma/forms/PostForm";
import DeliveryFeeForm from "@/prisma/forms/DeliveryFeeForm";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";
import { AdminUserManager } from "@/components/myComponents/subs/AdminUserManager";
import { useAppContext } from "@/hooks/useAppContext";
import { getStoreUrl } from "@/lib/store-url";
import { CartDetailsDialog } from "@/components/myComponents/subs/CartDetailsDialog";
import { formatPrice } from "@/lib/stock-pricing";
import { toast } from "sonner";
import SiteSettingsForm from "@/components/myComponents/subs/SiteSettingsForm";

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

function getFirstDayOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(date.setDate(diff));
}

const forms = [
  { name: "User", component: UserForm },
  { name: "Product", component: ProductForm },
  { name: "Category", component: CategoryForm },
  { name: "Stock", component: StockForm },
  { name: "FeaturedProduct", component: FeaturedProductForm },
  { name: "Review", component: ReviewForm },
  { name: "Notification", component: NotificationForm },
  { name: "Payment", component: PaymentForm },
  { name: "Refund", component: RefundForm },
  { name: "Cart", component: CartForm },
  { name: "Coupon", component: CouponForm },
  { name: "DeliveryFee", component: DeliveryFeeForm },
  { name: "ShippingAddress", component: ShippingAddressForm },
  { name: "Post", component: PostForm },
];

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

const Admin = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const { currentBusiness } = useAppContext();
    const storeName = params?.storeName as string | undefined;
    const isBusinessOwner =
      currentBusiness &&
      session?.user?.id &&
      String(currentBusiness.ownerId) === String(session.user.id);

    const [selectedForms, setSelectedForms] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [cartData, setCartData] = useState<any[]>([]);
    const [cartSearch, setCartSearch] = useState("");
    const [selectedCart, setSelectedCart] = useState<any | null>(null);
    const [cartDialogOpen, setCartDialogOpen] = useState(false);
    const [loadingCart, setLoadingCart] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showAllStatus, setShowAllStatus] = useState(false);

    const isAdmin = session?.user?.role === "admin";
    const isStaff = session?.user?.role === "staff";
    const [staffAccess, setStaffAccess] = useState(false);

    const toggleForm = (name: string) => {
      setSelectedForms((prev) =>
        prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
      );
    };

    const toggleAll = () => {
      if (selectedForms.length === filteredForms.length) {
        setSelectedForms([]);
      } else {
        setSelectedForms(filteredForms.map((f) => f.name));
      }
    };

    const filteredForms = useMemo(
      () =>
        forms.filter((f) =>
          (!isStaff || f.name === "Product") && f.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      [isStaff, searchQuery]
    );

    const allSelected = selectedForms.length === filteredForms.length && filteredForms.length > 0;
    const partiallySelected = selectedForms.length > 0 && selectedForms.length < filteredForms.length;

    const columns = [
      {
        accessorKey: "name",
        header: ({ table }: any) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                className={partiallySelected ? "bg-gray-400" : ""}
              />
              <span>Form Name</span>
            </div>
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1"
            />
          </div>
        ),
      },
      {
        accessorKey: "select",
        header: "Select",
        cell: ({ row }: any) => (
          <Checkbox
            checked={selectedForms.includes(row.original.name)}
            onCheckedChange={() => toggleForm(row.original.name)}
          />
        ),
      },
    ];

    const cartColumns = [
      { accessorKey: "userName", header: "Customer/Week" },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }: any) => {
          if (row.original.status === "separator") return null;
          return <span className="font-bold">₦{formatPrice(row.original.total || 0)}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => {
          if (row.original.status === "separator")
            return (
              <Badge className="bg-primary/20 text-primary border-none font-black">
                {row.original.userName}
              </Badge>
            );
          return (
            <Badge
              variant={row.original.status === "paid" ? "default" : "secondary"}
              className="uppercase font-black"
            >
              {row.original.status}
            </Badge>
          );
        },
      },
      { accessorKey: "createdAt", header: "Created At" },
    ];

    useEffect(() => {
      const redirectTarget = storeName ? getStoreUrl(storeName) : "/";
      const checkStaffAccess = async () => {
        if (!session?.user?.id || !currentBusiness?.id || !isStaff) return false;
        const response = await fetch(`/api/staff?businessId=${currentBusiness.id}`);
        if (!response.ok) return false;
        const applications = await response.json();
        return applications.some((application: any) => application.userId === session.user.id && application.status === "accepted");
      };
      if (status !== "loading" && currentBusiness) {
        if (session && isBusinessOwner) {
          setStaffAccess(false);
        } else if (session && isStaff) {
          checkStaffAccess().then(setStaffAccess);
        } else {
          router.replace(redirectTarget);
        }
      }
    }, [status, session, router, currentBusiness, isBusinessOwner, isStaff, storeName]);

    useEffect(() => {
      if (!isAdmin && !isStaff) return;

      const fetchCarts = async () => {
        try {
          const statusFilter = "paid,unconfirmed";
          const res = await fetch(
            `/api/dbhandler?model=cart&status=${statusFilter}&search=${cartSearch}`
          );
          let carts = await res.json();
          if (!Array.isArray(carts)) carts = [];

          carts.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const finalCarts: any[] = [];
          let currentWeek: number | null = null;

          carts.forEach((c: any) => {
            const deliveryDate = new Date(c.createdAt);
            const weekNum = getWeekNumber(deliveryDate);

            if (currentWeek !== weekNum) {
              currentWeek = weekNum;
              const firstDay = getFirstDayOfWeek(new Date(deliveryDate));
              finalCarts.push({
                id: `week-${weekNum}`,
                userName: `WEEK ${weekNum} - Starts ${firstDay.toLocaleDateString()}`,
                total: 0,
                status: "separator",
                createdAt: "",
                fullData: null,
              });
            }

            finalCarts.push({
              id: c.id,
              userName: c.user?.name || "Guest",
              total: c.total,
              status: c.status,
              createdAt: new Date(c.createdAt).toLocaleString(),
              fullData: c,
            });
          });

          setCartData(finalCarts);
        } catch (err) {
          console.error("Cart fetch failed", err);
        }
      };

      const debounce = setTimeout(fetchCarts, 500);
      return () => clearTimeout(debounce);
    }, [isAdmin, isStaff, cartSearch]);

    const canAccessAdmin = Boolean(isBusinessOwner || staffAccess);
    if (status === "loading" || !currentBusiness || !canAccessAdmin) {
      return null;
    }

  const handleCartRowClick = (row: any) => {
    if (row.status === 'separator') return;
    setSelectedCart(row.fullData);
    setCartDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedCart) return;
    setIsConfirming(true);
    try {
        const res = await fetch("/api/dbhandler?model=cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedCart.id,
                status: "paid"
            })
        });

        if (res.ok) {
            toast.success("Order payment confirmed successfully");
            setCartDialogOpen(false);
            // Refresh data
            setCartSearch(prev => prev + " "); // Trigger re-fetch briefly
            setTimeout(() => setCartSearch(prev => prev.trim()), 100);
        } else {
            throw new Error("Failed to confirm");
        }
    } catch (err) {
        console.error(err);
        toast.error("Could not confirm order status");
    } finally {
        setIsConfirming(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedCart) return;
    setIsRejecting(true);
    try {
      const bankAccount = currentBusiness?.siteSettings?.accountNumber || "";
      const bankName = currentBusiness?.siteSettings?.bankName || "";
      const accountName = currentBusiness?.siteSettings?.accountName || currentBusiness?.name || "Business Account";
      const refundPayload = {
        cartId: selectedCart.id,
        amount: Number(selectedCart.total || 0),
        reason: "Rejected by business owner",
        status: "rejected",
        businessId: currentBusiness?.id,
        bankName,
        accountNumber: bankAccount,
        accountName,
      };

      const refundRes = await fetch("/api/dbhandler?model=refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refundPayload),
      });

      if (!refundRes.ok) {
        const errorText = await refundRes.text();
        throw new Error(errorText || "Failed to create refund record");
      }

      const refund = await refundRes.json();
      const cartRes = await fetch("/api/dbhandler?model=cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCart.id,
          status: "rejected",
          refund: { connect: { id: refund.id } },
        })
      });

      if (!cartRes.ok) {
        throw new Error("Failed to update cart status");
      }

      toast.success("Order rejected and refund record created");
      setSelectedCart((prev) => prev ? { ...prev, status: "rejected", refund } : prev);
      setCartDialogOpen(true);
      setCartSearch(prev => prev + " ");
      setTimeout(() => setCartSearch(prev => prev.trim()), 100);
    } catch (err) {
      console.error(err);
      toast.error("Could not reject order");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.5, duration: 0.6, ease: "easeIn" },
      }}
      className="w-[100vw] p-4"
    >
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-4xl font-semibold">Admin Dashboard</h1>
        <Button
          onClick={() => router.push(getStoreUrl(storeName, "admin/analytics"))}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </Button>
      </div>

      <div className="max-w-sm mx-auto mb-10 flex flex-col gap-3">
        <AdminUserManager />
      </div>

      {/* Render selected forms */}
      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-5">
        {/* DataTable for form selection */}
        <div className="mb-6 max-w-md">
          <DataTableDemo columns={columns} data={filteredForms} />
        </div>

        {/* Site settings editor (owner-only) */}
        {isBusinessOwner && (
          <div className="col-span-full mt-4">
            <SiteSettingsForm />
          </div>
        )}

        {selectedForms.map((name) => {
          const FormComponent = forms.find((f) => f.name === name)?.component;
          if (!FormComponent) return null;
          return name === "Product" && isStaff
            ? <ProductForm key={name} hideList={true} />
            : <FormComponent key={name} />;
        })}
      </div>

      {/* ORDER MANAGEMENT SECTION */}
      {!isStaff && <div className="mt-12 bg-card p-6 rounded-2xl border shadow-sm col-span-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-primary" /> Active Orders
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Manage processing, paid, and unconfirmed customer carts</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <Input 
                placeholder="Search customer orders..." 
                value={cartSearch}
                onChange={(e) => setCartSearch(e.target.value)}
                className="max-w-xs h-10 rounded-lg shadow-sm"
             />
          </div>
        </div>
        
        {loadingCart ? (
          <TableSkeleton rows={8} columns={4} />
        ) : (
          <DataTableDemo
            columns={cartColumns}
            data={cartData}
            onRowClick={handleCartRowClick}
          />
        )}
      </div>}

      <CartDetailsDialog 
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        cart={selectedCart}
        onConfirmPayment={handleConfirmOrder}
        onRejectRefund={handleRejectOrder}
        loading={isConfirming}
        rejecting={isRejecting}
        businessBankDetails={currentBusiness?.siteSettings || {}}
      />

      <Separator className="my-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
        <div className="p-4 rounded-xl border bg-muted/20">
            <p className="text-xs font-black uppercase text-muted-foreground">Sales Revenue</p>
            <p className="text-2xl font-black mt-1">₦0.00</p>
        </div>
        <div className="p-4 rounded-xl border bg-muted/20">
            <p className="text-xs font-black uppercase text-muted-foreground">Estimated Profit</p>
            <p className="text-2xl font-black mt-1 text-emerald-600">₦0.00</p>
        </div>
        <div className="p-4 rounded-xl border bg-muted/20">
            <p className="text-xs font-black uppercase text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-black mt-1 text-red-600">₦0.00</p>
        </div>
        <div className="p-4 rounded-xl border bg-muted/20">
            <p className="text-xs font-black uppercase text-muted-foreground">Active Carts</p>
            <p className="text-2xl font-black mt-1">{cartData.length}</p>
        </div>
      </div>
    </motion.section>
  );
};

export default Admin;
