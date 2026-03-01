"use client";

import { CartClient } from "@/components/myComponents/subs/cart-client";
import { CartDetails } from "@/components/myComponents/subs/CartDetails";
import { DataTableDemo } from "@/components/myComponents/subs/datatable";
import { useAppContext } from "@/hooks/useAppContext";
import axios from "axios";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { CartSummary, getColumns } from "./columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CartPage() {
  const { user } = useAppContext();
  const [carts, setCarts] = useState<CartSummary[]>([]);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCarts = async () => {
    if (!user?.id || user.id === 'nil') return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/user-data?userId=${user.id}&model=cart`);
      setCarts(res.data);
    } catch (error) {
      console.error("Failed to fetch carts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, [user?.id]);

  const handleViewDetails = (id: string) => {
    setSelectedCartId(id);
    // Scroll to details view on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('cart-details-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const columns = getColumns();

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">

      <div className="flex flex-col gap-8">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Panel: Active Cart Management */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Current Session
                  </CardTitle>
                  <CardDescription>
                    Manage items currently in your cart ready for checkout.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-lg">
                    <CartClient />
                    <div className="text-sm text-muted-foreground">
                      Click the icon to view and edit your current active cart.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* History Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    View your previous carts and their status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">Loading history...</div>
                  ) : carts.length > 0 ? (
                    <DataTableDemo
                      data={carts}
                      columns={columns}
                      onRowClick={(row) => handleViewDetails(row.id)}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No cart history found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Selected Cart Details */}
            <div id="cart-details-view" className="lg:col-span-1">
              {selectedCartId ? (
                <div className="sticky top-4 h-[calc(100vh-2rem)]">
                  <CartDetails
                    cartId={selectedCartId}
                    onPaymentSuccess={() => {
                      fetchCarts(); // Refresh list on payment
                      // Optionally refresh details
                    }}
                  />
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10">
                  Select a cart to view details
                </div>
              )}
            </div>

          </div>
        </section>
      </div>

    </div>
  );
}
