"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Copy, Check, UploadCloud, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/hooks/useAppContext";
import { useCart } from "@/hooks/use-cart";
import axios from "axios";

export const ManualTransfer = React.forwardRef<
  HTMLButtonElement, 
  { tx_ref: string, amount: number, cartId: string, userId: string, guestDetails?: any }
>(({ tx_ref, amount, cartId, userId, guestDetails }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payeeName, setPayeeName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { clearCart } = useCart();
  const { setCheckoutData, currentBusiness } = useAppContext();
  const settings = currentBusiness?.siteSettings || {};

  // Account details from business site settings, env vars, or fallbacks
  const accountInfo = {
    bankName: settings.bankName || process.env.NEXT_PUBLIC_BANK_NAME || "Moniepoint MFB",
    accountNumber: settings.accountNumber || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "8065933700",
    accountName: settings.accountName || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "HealthClique Limited",
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    toast.success("Account details copied!");
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleConfirmTransfer = async () => {
    setIsSubmitting(true);
    try {
      let receiptUrl = "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "image");
        formData.append("userId", userId || "guest");
        formData.append("title", `Receipt for Cart ${cartId || "New"}`);
        formData.append("for", "payment_receipt");

        try {
          const uploadRes = await axios.post("/api/file/image", formData);
          if (uploadRes.status === 200) {
            receiptUrl = uploadRes.data.url;
          }
        } catch (uploadErr) {
          console.warn("Receipt upload warning:", uploadErr);
        }
      }

      await axios.post("/api/payment?action=confirm", { 
        tx_ref, 
        method: "manual_transfer",
        cartId,
        payeeName: payeeName || guestDetails?.name || "Customer",
        receiptUrl,
        guestDetails
      });

      toast.success("Transfer notification submitted! Your order is pending verification.");
      
      clearCart();
      setCheckoutData(null);
      setIsOpen(false);
    } catch (err) {
       console.error("Manual confirm error:", err);
       toast.error("Failed to submit transfer notification.");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button ref={ref} variant="outline" className="w-full h-12 rounded-xl font-bold border-2 hover:bg-muted/5 transition-all gap-2 truncate whitespace-nowrap overflow-hidden">
          <Landmark className="w-4 h-4 text-primary" />
          <span className="truncate">Bank Transfer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Landmark className="w-6 h-6 text-primary" />
            Bank Transfer Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-primary/5 p-4 rounded-2xl border-2 border-primary/20 space-y-3">
             <div className="flex justify-between items-start">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Amount to Pay</p>
                <p className="text-xl font-black text-primary">₦{amount.toFixed(2)}</p>
             </div>
             <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Bank Name:</span>
                <span>{accountInfo.bankName}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">Account Number:</span>
                <div className="flex items-center gap-2">
                   <p className="font-black text-lg font-mono">{accountInfo.accountNumber}</p>
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(accountInfo.accountNumber)}>
                      {copiedAccount ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                   </Button>
                </div>
             </div>
             <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">Account Name:</span>
                <span className="text-right font-semibold">{accountInfo.accountName}</span>
             </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-1">
              <Label htmlFor="payeeName" className="text-xs font-bold">Sender Account Name</Label>
              <Input
                id="payeeName"
                placeholder="e.g. John Doe"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                className="h-10 text-xs font-bold rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="receipt" className="text-xs font-bold">Upload Receipt (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="receipt"
                  className="flex items-center justify-center gap-2 cursor-pointer border rounded-xl px-3 py-2 text-xs font-bold hover:bg-muted w-full h-10 border-dashed"
                >
                  <Upload className="h-4 w-4 text-primary" />
                  {file ? file.name : "Select Receipt Image"}
                </Label>
              </div>
              {preview && (
                <div className="relative h-28 w-full rounded-xl overflow-hidden border mt-2">
                  <img src={preview} alt="Receipt preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex gap-2 items-start">
              <UploadCloud className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-amber-600 leading-tight">
                After transfer, click the button below to confirm. Your order will be processed once verified.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 flex flex-col gap-2">
           <Button className="w-full h-11 rounded-xl font-black shadow-xl shadow-primary/10" disabled={isSubmitting} onClick={handleConfirmTransfer}>
             {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</> : "Confirm Transfer"}
           </Button>
           <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground h-9" onClick={() => setIsOpen(false)}>
             Cancel & Choose Other Method
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ManualTransfer.displayName = "ManualTransfer";
