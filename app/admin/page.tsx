"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DataTableDemo } from "@/components/myComponents/subs/datatable";
import { useAppContext } from "@/hooks/useAppContext";

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
import AddressPriceForm from "@/prisma/forms/AddressPriceForm";
import { CartDetailsDialog } from "@/components/myComponents/subs/CartDetailsDialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";


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
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

/* ================= FORMS ================= */

const allForms = [
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
  { name: "ShippingAddress", component: ShippingAddressForm },
  { name: "Post", component: PostForm },
  { name: "AddressPrice", component: AddressPriceForm },
];

const staffForms = ["Cart", "Stock", "Notification", "AddressPrice"];

/* ================= COMPONENT ================= */

const Admin = () => {
  const { user } = useAppContext();

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";

  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartData, setCartData] = useState<any[]>([]);
  const [notificationData, setNotificationData] = useState<any[]>([]);
  const [selectedCart, setSelectedCart] = useState<any | null>(null);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);


  /* ================= PERMISSIONS ================= */

  const forms = isAdmin
    ? allForms
    : isStaff
      ? allForms.filter(f => staffForms.includes(f.name))
      : [];

  /* ================= FORM SELECTION ================= */

  const toggleForm = (name: string) => {
    setSelectedForms(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const filteredForms = useMemo(
    () => forms.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, forms]
  );

  const toggleAll = () => {
    if (selectedForms.length === filteredForms.length) {
      setSelectedForms([]);
    } else {
      setSelectedForms(filteredForms.map(f => f.name));
    }
  };

  const allSelected =
    selectedForms.length === filteredForms.length && filteredForms.length > 0;

  const partiallySelected =
    selectedForms.length > 0 && selectedForms.length < filteredForms.length;

  /* ================= TABLE COLUMNS ================= */

  const formColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: () => (
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
    ],
    [selectedForms, searchQuery, filteredForms]
  );

  const cartColumns = useMemo(
    () => [
      { accessorKey: "name", header: "Name/Week" },
      { accessorKey: "userName", header: "User" },
      { accessorKey: "total", header: "Total" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "deliveryDate", header: "Delivery Time" },
      { accessorKey: "createdAt", header: "Created At" },
    ],
    []
  );

  const notificationColumns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "userName", header: "User" },
      { accessorKey: "message", header: "Message" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "createdAt", header: "Created At" },
    ],
    []
  );

  /* ================= DATA FETCH ================= */
  
  const [cartSearch, setCartSearch] = useState("");

  useEffect(() => {
    if (!isAdmin && !isStaff) return;

    const fetchData = async () => {
      try {
        /* ===== CARTS (PAID + UNCONFIRMED) ===== */
        const cartsRes = await fetch(
          `/api/dbhandler?model=cart&status=paid,unconfirmed&search=${cartSearch}`
        );

        let carts = await cartsRes.json();
        if (!Array.isArray(carts)) carts = [];

        // Sorting by deliveryDate
        carts.sort((a: any, b: any) => {
            const dateA = new Date(a.deliveryDate || a.createdAt).getTime();
            const dateB = new Date(b.deliveryDate || b.createdAt).getTime();
            return dateA - dateB;
        });

        // Grouping and adding separators
        const finalCarts: any[] = [];
        let currentWeek: number | null = null;

        carts.forEach((c: any) => {
            const deliveryDate = new Date(c.deliveryDate || c.createdAt);
            const weekNum = getWeekNumber(deliveryDate);
            
            if (currentWeek !== weekNum) {
                currentWeek = weekNum;
                const firstDay = getFirstDayOfWeek(new Date(deliveryDate));
                finalCarts.push({
                    id: `week-${weekNum}`,
                    name: `WEEK ${weekNum} - Starts ${firstDay.toLocaleDateString()}`,
                    userName: "",
                    total: "",
                    status: "separator",
                    deliveryDate: "",
                    createdAt: ""
                });
            }

            finalCarts.push({
                id: c.id,
                name: c.name || "N/A",
                userName: c.user?.name || "Unknown",
                total: c.total,
                status: c.status,
                deliveryDate: deliveryDate.toLocaleString(),
                createdAt: new Date(c.createdAt).toLocaleString(),
            });
        });

        setCartData(finalCarts);

        /* ===== NOTIFICATIONS ===== */
        // ... notifications fetch unchanged
        const notifRes = await fetch("/api/dbhandler?model=notification");
        let notifications = await notifRes.json();
        if (!Array.isArray(notifications)) notifications = [];

        notifications = notifications.filter(
          (n: any) => isAdmin || (isStaff && n.to?.toLowerCase() === "staff")
        );

        setNotificationData(
          notifications.map((n: any) => ({
            id: n.id,
            userName: n.username || "Unknown",
            message: n.message,
            category: n.category,
            createdAt: new Date(n.createdAt).toLocaleString(),
          }))
        );
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    const debounce = setTimeout(fetchData, 500);
    return () => clearTimeout(debounce);
  }, [isAdmin, isStaff, cartSearch]);

  /* ================= GUARD ================= */

  if (!isAdmin && !isStaff) {
    return (
      <div className="w-full p-4 text-center text-red-600 font-bold">
        You do not have permission to access this page.
      </div>
    );
  }

  const handleCartRowClick = async (cartRow: any) => {
    setLoadingCart(true);
    setCartDialogOpen(true);

    try {
      const res = await fetch(
        `/api/dbhandler?model=cart&id=${cartRow.id}`
      );
      const fullCart = await res.json();
      setSelectedCart(fullCart);
    } catch (err) {
      console.error("Failed to load cart details", err);
    } finally {
      setLoadingCart(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedCart) return;

    try {
      const res = await fetch("/api/dbhandler?model=cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCart.id,
          status: "paid",
          adminConfirmed: true,
        }),
      });

      if (!res.ok) throw new Error("Confirmation failed");

      // Update UI immediately
      setSelectedCart((prev: any) => ({
        ...prev,
        status: "paid",
      }));

      // Update table list
      setCartData(prev =>
        prev.map(c =>
          c.id === selectedCart.id ? { ...c, status: "paid" } : c
        )
      );
    } catch (err) {
      console.error("Failed to confirm payment", err);
    }
  };



  /* ================= UI ================= */

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.5, duration: 0.6, ease: "easeIn" },
      }}
      className="w-[100vw] p-4"
    >
      <CartDetailsDialog
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        cart={selectedCart}
        onConfirmPayment={handleConfirmPayment}
      />

      <div className="text-4xl font-semibold w-full text-center mb-6">
        Admin Dashboard
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-5">
        {/* FORM SELECTOR */}
        <div>
          <Link href="/admin/analytics">
            <Button>Analytics</Button>
          </Link>
        </div>
        <div className="mb-6 max-w-md">
          <DataTableDemo columns={formColumns} data={filteredForms} />
        </div>

        {selectedForms.map(name => {
          const FormComponent = forms.find(f => f.name === name)?.component;
          return FormComponent ? <FormComponent key={name} /> : null;
        })}
      </div>

      {/* CARTS */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold">
            Paid & Unconfirmed Carts
          </h3>
          <Input 
            placeholder="Search carts..." 
            value={cartSearch}
            onChange={(e) => setCartSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <DataTableDemo
          columns={cartColumns}
          data={cartData}
          onRowClick={handleCartRowClick}
        />
      </div>

      {/* NOTIFICATIONS */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Notifications</h3>
        <DataTableDemo
          columns={notificationColumns}
          data={notificationData}
        />
      </div>
    </motion.section>
  );
};

export default Admin;
