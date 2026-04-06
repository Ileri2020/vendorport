"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function CartDetailsDialog({
    open,
    onOpenChange,
    cart,
    isLoading,
    onConfirmPayment,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cart: any;
    isLoading?: boolean;
    onConfirmPayment: () => void;
}) {
    if (!cart && !isLoading) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Cart Details</DialogTitle>
                </DialogHeader>

                {/* USER */}
                {isLoading ? (
                  <div className="space-y-3 p-3 border rounded-md bg-muted/50">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="mb-2 text-xs uppercase font-semibold text-muted-foreground">Customer</div>
                        <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                      </div>
                      <div>
                        <div className="mb-2 text-xs uppercase font-semibold text-muted-foreground">Email</div>
                        <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
                      </div>
                      <div>
                        <div className="mb-2 text-xs uppercase font-semibold text-muted-foreground">Contact</div>
                        <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
                      </div>
                      <div>
                        <div className="mb-2 text-xs uppercase font-semibold text-muted-foreground">Status</div>
                        <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="font-semibold block text-xs uppercase">Customer</span>
                            {cart.user?.name || "Guest"}
                        </div>
                        <div>
                            <span className="font-semibold block text-xs uppercase">Email</span>
                            {cart.user?.email || "N/A"}
                        </div>
                        <div>
                            <span className="font-semibold block text-xs uppercase">Contact</span>
                            {cart.user?.contact || "N/A"}
                        </div>
                         <div>
                            <span className="font-semibold block text-xs uppercase">Status</span>
                            <span className={`badge ${cart.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                {cart.status}
                            </span>
                        </div>
                    </div>
                  </div>
                )}

                {/* PRODUCTS */}
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Products</h4>
                    <div className="space-y-2">
                        {cart.products.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex justify-between border-b pb-1"
                            >
                                <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                                <p>
                                    ₦{(item.product.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAYMENT */}
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Payment</h4>
                    {cart.payment ? (
                        <>
                            <p>Method: {cart.payment.method}</p>
                            <p>Amount: ₦{cart.payment.amount}</p>
                            <p>TX Ref: {cart.payment.tx_ref}</p>
                        </>
                    ) : (
                        <p className="text-muted-foreground">No payment record</p>
                    )}
                </div>

                {/* TOTAL */}
                <div className="mt-4 font-bold text-lg">
                    Total: ₦{cart.total}
                </div>

                {/* CONFIRM BUTTON */}
                {cart.status === "unconfirmed" && (
                    <DialogFooter>
                        <Button onClick={onConfirmPayment}>
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
