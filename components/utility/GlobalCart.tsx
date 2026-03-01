"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, Package, Sparkles, Upload, Send } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { PriceDisplay } from "@/components/utility/PriceDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppContext } from "@/hooks/useAppContext";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import axios from "axios";

export const GlobalCart = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = React.useState(false);

  const trigger = (
    <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-full hover:bg-accent/10">
      <ShoppingCart className="h-6 w-6" />
      <CartBadge />
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="h-[90vh]">
          <InnerCartContent close={() => setIsOpen(false)} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <InnerCartContent close={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

const CartBadge = () => {
  const { itemCount } = useCart();
  if (itemCount === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow-lg animate-in zoom-in">
      {itemCount}
    </span>
  );
};

const InnerCartContent = ({ close }: { close: () => void }) => {
  const { currentBusiness } = useAppContext();
  const { items, removeItem, updateQuantity, subtotal, clearCart, addItem, allCarts, clearAllCarts } = useCart();
  const [businesses, setBusinesses] = React.useState<any[]>([]);

  // Fetch all business names for global cart labeling
  React.useEffect(() => {
    if (!currentBusiness) {
       axios.get('/api/dbhandler?model=business').then(res => setBusinesses(res.data)).catch(() => {});
    }
  }, [currentBusiness]);

  const getBusinessName = (bid: string) => {
     if (bid === 'global') return 'VendorPort Global';
     return businesses.find(b => b.id === bid)?.name || `Store ${bid.slice(-4)}`;
  };
  
  // AI State
  const [isAiMode, setIsAiMode] = React.useState(false);
  const [aiInput, setAiInput] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [aiResults, setAiResults] = React.useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<Record<number, string[]>>({});
  const [strategy, setStrategy] = React.useState<'manual' | 'cheapest' | 'moderate' | 'expensive'>('manual');

  const handleAiShop = async () => {
    if (!aiInput.trim()) return;
    setIsProcessing(true);
    try {
      const res = await axios.post('/api/ai/shop', { 
         query: aiInput,
         businessId: currentBusiness?.id // Could be null for global platform search
      });
      
      const results = res.data.results || [];
      if (results.length > 0) {
        setAiResults(results);
        const newSelection: Record<number, string[]> = {};
        results.forEach((item: any, idx: number) => {
           if (item.options.length === 0) return;
           if (strategy === 'manual' && item.options.length === 1) {
              newSelection[idx] = [item.options[0].id];
           } else if (strategy !== 'manual') {
              const sorted = [...item.options].sort((a, b) => a.price - b.price);
              let selected;
              if (strategy === 'cheapest') selected = sorted[0];
              else if (strategy === 'expensive') selected = sorted[sorted.length - 1];
              else selected = sorted[Math.floor(sorted.length / 2)];
              newSelection[idx] = [selected.id];
           } else {
              newSelection[idx] = [];
           }
        });
        setSelectedOptions(newSelection);
        toast.success(`AI identified ${results.length} items.`);
      } else {
        toast.info("AI couldn't find items.");
      }
    } catch (err) {
      toast.error("AI Shopping failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOption = (itemIdx: number, optionId: string) => {
    setSelectedOptions(prev => {
      const current = prev[itemIdx] || [];
      const updated = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId];
      return { ...prev, [itemIdx]: updated };
    });
  };

  const addAllSelectedToCart = () => {
    let count = 0;
    aiResults.forEach((res, idx) => {
      const selectedIds = selectedOptions[idx] || [];
      selectedIds.forEach(id => {
        const option = res.options.find((o: any) => o.id === id);
        if (option) {
          addItem({
            id: option.id,
            name: option.name,
            price: option.price,
            images: option.images || [option.image],
            category: option.category?.name || "AI Multi",
            businessId: option.businessId // Crucial for global cart identification
          }, option.requestedQuantity || 1);
          count++;
        }
      });
    });
    if (count > 0) {
      toast.success(`Added ${count} items!`);
      setIsAiMode(false);
      setAiResults([]);
    }
  };

  const isPlatformView = !currentBusiness;
  const cartEntries = isPlatformView 
    ? Object.entries(allCarts).filter(([_, cart]) => cart.length > 0)
    : [[currentBusiness.id, items]];

  const totalGlobalAmount = isPlatformView
    ? cartEntries.reduce((acc, [_, cart]) => acc + cart.reduce((t, i) => t + (i.price * i.quantity), 0), 0)
    : subtotal;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center bg-background shrink-0">
        <h2 className="text-xl font-black flex items-center gap-2">
           <ShoppingCart className="h-5 w-5 text-accent" />
           {isAiMode ? "AI Shopping" : (isPlatformView ? "Global Bag" : "Store Bag")}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => { setIsAiMode(!isAiMode); setAiResults([]); }} className="gap-2 text-accent font-bold bg-accent/5 hover:bg-accent/10 rounded-full">
           <Sparkles className="h-4 w-4" /> {isAiMode ? "Exit AI" : "Smart Search"}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {isAiMode ? (
            <div className="space-y-6">
               {/* Search AI UI (Existing) */}
               {aiResults.length === 0 ? (
                 <div className="bg-accent/5 p-5 rounded-3xl border border-accent/20 space-y-4">
                    <div className="relative">
                       <textarea 
                         className="w-full h-40 p-4 rounded-2xl border bg-white text-sm resize-none focus:ring-2 ring-accent/50 outline-none transition-all"
                         placeholder="List what you need from all our stores... (e.g. 2 Paracetamol, 1 Nike Shoe, Blue Shirt)"
                         value={aiInput}
                         onChange={(e) => setAiInput(e.target.value)}
                       />
                       <div className="absolute bottom-4 right-4 flex gap-2">
                          <input 
                             type="file" 
                             id="ai-upload" 
                             className="hidden" 
                             accept="image/*,.pdf,.txt"
                             onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) toast.success(`Attached ${file.name}. AI will analyze it.`);
                             }}
                          />
                          <Button 
                             size="icon" 
                             variant="secondary" 
                             className="h-10 w-10 rounded-xl"
                             onClick={() => document.getElementById('ai-upload')?.click()}
                          >
                             <Upload className="h-4 w-4" />
                          </Button>
                       </div>
                    </div>
                    <Button className="w-full h-14 bg-accent rounded-2xl font-black text-lg shadow-lg shadow-accent/20 group" onClick={handleAiShop} disabled={isProcessing}>
                       {isProcessing ? (
                         <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            AI is Shopping...
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                            <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Start Smart Shopping
                         </div>
                       )}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest opacity-60">AI will scan 500+ stores for the best match</p>
                 </div>
               ) : (
                 <div className="space-y-8">
                    {aiResults.map((item, idx) => (
                       <div key={idx} className="space-y-3">
                          <h4 className="font-bold text-sm">{item.identifiedItem.name}</h4>
                          <div className="grid gap-2">
                             {item.options.map((opt: any) => (
                               <div key={opt.id} onClick={() => toggleOption(idx, opt.id)} className={`p-3 rounded-2xl border-2 cursor-pointer flex justify-between ${selectedOptions[idx]?.includes(opt.id) ? 'border-accent bg-accent/5' : 'bg-muted/30'}`}>
                                  <div className="min-w-0">
                                     <p className="text-xs font-black truncate">{opt.name}</p>
                                     <p className="text-[10px] text-muted-foreground">{getBusinessName(opt.businessId)}</p>
                                  </div>
                                  <PriceDisplay amount={opt.price} className="text-xs font-bold text-accent" />
                               </div>
                             ))}
                          </div>
                       </div>
                    ))}
                    <Button className="w-full h-14 rounded-2xl bg-accent font-black" onClick={addAllSelectedToCart}>Add Selected</Button>
                 </div>
               )}
            </div>
          ) : (
            <div className="space-y-8">
              {cartEntries.length === 0 ? (
                <div className="h-[50vh] flex flex-col items-center justify-center opacity-40"><Package className="h-16 w-16" /><p>Bag is empty.</p></div>
              ) : (
                cartEntries.map(([bid, bizItems]) => (
                  <div key={bid} className="space-y-4">
                     {isPlatformView && (
                       <div className="flex justify-between items-center bg-muted/20 p-2 px-3 rounded-lg border">
                          <span className="text-[10px] font-black uppercase tracking-widest text-accent">{getBusinessName(bid)}</span>
                          <PriceDisplay amount={bizItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)} className="text-xs font-bold" />
                       </div>
                     )}
                     <div className="space-y-4">
                       {bizItems.map((item) => (
                         <div key={item.id} className="flex gap-4">
                           <div className="h-16 w-16 bg-muted rounded-xl overflow-hidden border shrink-0">
                             <img src={item.images?.[0] || item.image || '/placeholder.png'} alt={item.name} className="h-full w-full object-cover" />
                           </div>
                           <div className="flex-1 space-y-1 min-w-0">
                             <h4 className="font-black text-xs truncate">{item.name}</h4>
                             <PriceDisplay amount={item.price} className="text-xs font-bold text-accent" />
                             <div className="flex items-center gap-3 pt-1">
                               <div className="flex items-center border rounded-full px-2 py-0.5 gap-3 bg-muted/10">
                                 <button onClick={() => updateQuantity(item.id, item.quantity - 1, bid)} className="p-1"><Minus className="h-2 w-2" /></button>
                                 <span className="text-[10px] font-black">{item.quantity}</span>
                                 <button onClick={() => updateQuantity(item.id, item.quantity + 1, bid)} className="p-1"><Plus className="h-2 w-2" /></button>
                               </div>
                               <button onClick={() => removeItem(item.id, bid)} className="hover:text-destructive ml-auto"><Trash2 className="h-3 w-3" /></button>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t bg-background shrink-0 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center font-black text-2xl">
            <span>Total</span>
            <PriceDisplay amount={totalGlobalAmount} />
          </div>
        </div>
        <Button className="w-full h-14 rounded-2xl text-lg font-black bg-accent shadow-xl active:scale-95" onClick={close}>
          {isPlatformView ? "Proceed to Multi-Shop" : "Checkout Now"}
        </Button>
        {cartEntries.length > 0 && (
          <Button variant="ghost" size="sm" onClick={isPlatformView ? clearAllCarts : clearCart} className="w-full text-muted-foreground hover:text-destructive font-bold text-xs uppercase tracking-tighter">
             EMPTY {isPlatformView ? 'ALL BAGS' : 'THIS BAG'}
          </Button>
        )}
      </div>
    </div>
  );
};
