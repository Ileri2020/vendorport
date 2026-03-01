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
  const { items, removeItem, updateQuantity, subtotal, clearCart, addItem } = useCart();
  
  // AI State
  const [isAiMode, setIsAiMode] = React.useState(false);
  const [aiInput, setAiInput] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [aiResults, setAiResults] = React.useState<any[]>([]); // Step 2 results
  const [selectedOptions, setSelectedOptions] = React.useState<Record<number, string[]>>({});
  const [strategy, setStrategy] = React.useState<'manual' | 'cheapest' | 'moderate' | 'expensive'>('manual');

  const handleAiShop = async () => {
    if (!aiInput.trim()) return;
    setIsProcessing(true);
    try {
      const res = await axios.post('/api/ai/shop', { 
         query: aiInput,
         businessId: currentBusiness?.id
      });
      
      const results = res.data.results || [];
      if (results.length > 0) {
        setAiResults(results);
        
        // Auto-selection logic based on strategy
        const newSelection: Record<number, string[]> = {};
        results.forEach((item: any, idx: number) => {
           if (item.options.length === 0) return;
           
           if (strategy === 'manual' && item.options.length === 1) {
              newSelection[idx] = [item.options[0].id];
           } else if (strategy !== 'manual') {
              // Sort options by price
              const sorted = [...item.options].sort((a, b) => a.price - b.price);
              let selected;
              if (strategy === 'cheapest') selected = sorted[0];
              else if (strategy === 'expensive') selected = sorted[sorted.length - 1];
              else selected = sorted[Math.floor(sorted.length / 2)]; // Moderate
              
              newSelection[idx] = [selected.id];
           } else {
              newSelection[idx] = [];
           }
        });
        setSelectedOptions(newSelection);
        
        toast.success(`AI identified ${results.length} items. Review selections below.`);
      } else {
        toast.info("AI couldn't find items. Try being more specific.");
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
      const updated = current.includes(optionId) 
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
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
            category: option.category?.name || "AI Multi"
          }, option.requestedQuantity || 1);
          count++;
        }
      });
    });
    if (count > 0) {
      toast.success(`Added ${count} items to your bag!`);
      setIsAiMode(false);
      setAiResults([]);
    } else {
      toast.error("Please select at least one option.");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center bg-background shrink-0">
        <h2 className="text-xl font-black flex items-center gap-2">
           <ShoppingCart className="h-5 w-5 text-accent" />
           {isAiMode ? "AI Shopping" : "Your Bag"}
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setIsAiMode(!isAiMode);
            setAiResults([]);
          }} 
          className="gap-2 text-accent font-bold bg-accent/5 hover:bg-accent/10 rounded-full"
        >
           <Sparkles className="h-4 w-4" /> {isAiMode ? "Exit AI" : "AI Assistant"}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {isAiMode ? (
            <div className="space-y-6">
              {aiResults.length === 0 ? (
                /* Step 1: Input */
                <div className="bg-accent/5 p-5 rounded-3xl border border-accent/20 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                         <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                         <h4 className="font-black text-sm">AI Smart Search</h4>
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Two-step intelligent shopping</p>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 pt-2">
                      {(['manual', 'cheapest', 'moderate', 'expensive'] as const).map((s) => (
                        <Button 
                          key={s}
                          variant={strategy === s ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setStrategy(s)}
                          className={`rounded-full text-[10px] uppercase font-bold h-7 ${strategy === s ? 'bg-accent' : ''}`}
                        >
                          {s === 'manual' ? 'Let me choose' : `${s} price`}
                        </Button>
                      ))}
                   </div>

                   <textarea 
                     className="w-full h-40 p-4 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm resize-none"
                     placeholder="e.g. 5 pieces of Jollof Rice, 2 Cold Stone, and a bottle of water..."
                     value={aiInput}
                     onChange={(e) => setAiInput(e.target.value)}
                   />
                   <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2 border-dashed h-12 rounded-xl">
                         <Upload className="h-4 w-4" /> Snap List
                      </Button>
                      <Button 
                        className="flex-1 gap-2 h-12 bg-accent rounded-xl" 
                        onClick={handleAiShop}
                        disabled={isProcessing}
                      >
                         {isProcessing ? "Analyzing..." : <><Send className="h-4 w-4" /> Search Items</>}
                      </Button>
                   </div>
                </div>
              ) : (
                /* Step 2: Review Results */
                <div className="space-y-8 animate-in slide-in-from-bottom-5">
                   <div className="flex items-center justify-between">
                      <h3 className="font-black text-lg">Match Results</h3>
                      <Button variant="ghost" size="sm" onClick={() => setAiResults([])} className="text-xs">Reset Search</Button>
                   </div>

                   {aiResults.map((item, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                           <h4 className="font-bold text-sm flex items-center gap-2">
                              <span className="h-5 w-5 rounded bg-accent/10 text-accent flex items-center justify-center text-[10px]">{idx + 1}</span>
                              {item.identifiedItem.name} 
                              <span className="text-muted-foreground text-[10px]">x{item.identifiedItem.quantity}</span>
                           </h4>
                        </div>
                        
                        <div className="grid gap-2">
                           {item.options.length > 0 ? (
                             item.options.map((opt: any) => (
                               <div 
                                 key={opt.id}
                                 onClick={() => toggleOption(idx, opt.id)}
                                 className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                    selectedOptions[idx]?.includes(opt.id) 
                                    ? 'border-accent bg-accent/5' 
                                    : 'border-transparent bg-muted/30 hover:bg-muted/50'
                                 }`}
                               >
                                  <div className="flex items-center gap-3">
                                     <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${selectedOptions[idx]?.includes(opt.id) ? 'border-accent bg-accent' : 'border-muted-foreground/30'}`}>
                                        {selectedOptions[idx]?.includes(opt.id) && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                     </div>
                                     <div className="min-w-0">
                                        <p className="text-xs font-black truncate">{opt.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{opt.category?.name || 'General'}</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <PriceDisplay amount={opt.price} className="text-xs font-bold text-accent" />
                                  </div>
                               </div>
                             ))
                           ) : (
                             <div className="p-4 rounded-2xl border-2 border-dashed border-muted-foreground/10 text-center text-xs text-muted-foreground italic">
                                No direct matches found in this store.
                             </div>
                           )}
                        </div>
                      </div>
                   ))}

                   <Button className="w-full h-14 rounded-2xl bg-accent font-black shadow-lg" onClick={addAllSelectedToCart}>
                      Add Selected to Bag
                   </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {items.length === 0 ? (
                <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Package className="h-16 w-16" />
                  <p className="font-medium">Your bag is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="h-20 w-20 bg-muted rounded-2xl overflow-hidden shadow-sm shrink-0 border">
                      <img src={item.images?.[0] || item.image || '/placeholder.png'} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <h4 className="font-black text-sm truncate">{item.name}</h4>
                      <PriceDisplay amount={item.price} className="text-sm font-bold text-accent" />
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center border rounded-full px-2 py-1 gap-4 bg-muted/20">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-accent p-1"><Minus className="h-3 w-3" /></button>
                          <span className="text-xs font-black min-w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-accent p-1"><Plus className="h-3 w-3" /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-auto p-1"><Trash2 className="h-4 w-4" /></button>
                      </div>
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
          <div className="flex justify-between items-center text-muted-foreground text-sm font-medium">
            <span>Subtotal</span>
            <PriceDisplay amount={subtotal} />
          </div>
          <div className="flex justify-between items-center font-black text-2xl">
            <span>Total</span>
            <PriceDisplay amount={subtotal} />
          </div>
        </div>
        <Button className="w-full h-14 rounded-2xl text-lg font-black bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 transition-all active:scale-95" onClick={close}>
          Checkout Now
        </Button>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCart} className="w-full text-muted-foreground hover:text-destructive font-bold text-xs">
             CLEAR ENTIRE BAG
          </Button>
        )}
      </div>
    </div>
  );
};
