"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import StockTable from './stockdatatable';
import { Trash2, Plus } from 'lucide-react';

import { AdminFormContainer } from '@/components/utility/AdminFormContainer';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBasket, Layers, ArrowRight } from 'lucide-react';

export default function StockForm() {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState<any>([]);
  const [stockQueue, setStockQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStocks();
    fetchProducts();
  }, []);

  const fetchStocks = async () => {
    try {
      const res = await axios.get('/api/stock');
      setStocks(res.data);
    } catch (err) {
      console.error("Failed to fetch stocks:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/dbhandler?model=product');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToQueue = (product: any) => {
    if (stockQueue.find(item => item.productId === product.id)) {
      toast.warning("Product already in stocking queue");
      return;
    }

    setStockQueue([...stockQueue, {
      productId: product.id,
      name: product.name,
      addedQuantity: 1,
      costPerProduct: 0,
      pricePerProduct: product.price || 0
    }]);
    toast.success(`${product.name} added to queue`);
  };

  const removeFromQueue = (index: number) => {
    const newQueue = [...stockQueue];
    newQueue.splice(index, 1);
    setStockQueue(newQueue);
  };

  const updateQueueItem = (index: number, field: string, value: any) => {
    const newQueue = [...stockQueue];
    newQueue[index][field] = value;
    setStockQueue(newQueue);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (stockQueue.length === 0) {
      toast.error("Stocking queue is empty");
      return;
    }

    for (const item of stockQueue) {
      if (item.addedQuantity <= 0) {
        toast.error(`Invalid quantity for ${item.name}`);
        return;
      }
    }

    setLoading(true);
    try {
      const promises = stockQueue.map(item => 
        axios.post('/api/stock', {
          productId: item.productId,
          addedQuantity: item.addedQuantity,
          costPerProduct: item.costPerProduct,
          pricePerProduct: item.pricePerProduct
        })
      );

      await Promise.all(promises);
      toast.success(`Successfully stocked ${stockQueue.length} products`);
      setStockQueue([]);
      fetchStocks();
    } catch (err) {
      console.error("Batch stocking failed:", err);
      toast.error("Failed to stock some products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-5xl mx-auto'>
      <AdminFormContainer 
        title="Stock Management" 
        description="Update inventory levels and costs for your products."
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <div className='lg:col-span-2 space-y-4'>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-widest text-primary/60">Product Search</h3>
              <Badge variant="outline">{filteredProducts.length}</Badge>
            </div>
            
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Filter products..."
                 className="h-10 pl-9 rounded-xl border-2"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>

            <div className='max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar'>
              {filteredProducts.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl hover:bg-white hover:border-accent/10 border-2 border-transparent transition-all group shadow-sm">
                  <div className='flex-1 min-w-0 mr-2'>
                    <p className='font-bold text-sm truncate uppercase tracking-tight'>{item.name}</p>
                    <p className='text-[10px] text-muted-foreground font-black tracking-widest uppercase'>₦{(item.price || 0).toLocaleString()}</p>
                  </div>
                  <Button 
                    type="button" 
                    size="icon" 
                    onClick={() => addToQueue(item)}
                    className='h-8 w-8 rounded-lg shadow-lg shadow-primary/20'
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="py-10 text-center text-muted-foreground text-sm italic">No matching products.</div>
              )}
            </div>
          </div>

          <div className='lg:col-span-3 space-y-4'>
            <div className="p-6 bg-accent/5 rounded-[2.5rem] border-2 border-accent/10 flex flex-col h-full min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="font-black text-lg uppercase tracking-tight text-accent">Active Queue</h3>
                   <p className="text-[10px] text-accent/60 font-black tracking-widest uppercase">Preparing for update</p>
                 </div>
                 <Badge className="bg-accent text-white border-none">{stockQueue.length} ITEMS</Badge>
              </div>

              <form onSubmit={handleBatchSubmit} className='flex-1 flex flex-col'>
                <div className='flex-1 overflow-y-auto max-h-[400px] space-y-4 pr-1 mb-6 custom-scrollbar'>
                  {stockQueue.length > 0 ? (
                    stockQueue.map((item, index) => (
                      <div key={item.productId} className='p-4 bg-white rounded-3xl border-2 border-accent/5 shadow-xl shadow-accent/5 relative group transition-all hover:scale-[1.01]'>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className='absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                          onClick={() => removeFromQueue(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                        
                        <p className='font-black text-xs text-primary/40 uppercase tracking-widest mb-2'>ITEM #{index + 1}</p>
                        <h4 className='font-black text-sm truncate pr-8 mb-4 uppercase tracking-tight'>{item.name}</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <div className='space-y-1.5'>
                              <Label className='text-[9px] font-black uppercase tracking-widest text-muted-foreground'>Quantity</Label>
                              <Input 
                                type="number" 
                                min="1"
                                className="h-9 font-bold bg-muted/20 border-none"
                                value={item.addedQuantity}
                                onChange={(e) => updateQueueItem(index, 'addedQuantity', Number(e.target.value))}
                              />
                           </div>
                           <div className='space-y-1.5'>
                              <Label className='text-[9px] font-black uppercase tracking-widest text-muted-foreground'>Cost (₦)</Label>
                              <Input 
                                type="number" 
                                className="h-9 font-bold bg-muted/20 border-none"
                                value={item.costPerProduct}
                                onChange={(e) => updateQueueItem(index, 'costPerProduct', Number(e.target.value))}
                              />
                           </div>
                           <div className='space-y-1.5'>
                              <Label className='text-[9px] font-black uppercase tracking-widest text-muted-foreground'>Price (₦)</Label>
                              <Input 
                                type="number" 
                                className="h-9 font-bold bg-muted/20 border-none"
                                value={item.pricePerProduct}
                                onChange={(e) => updateQueueItem(index, 'pricePerProduct', Number(e.target.value))}
                              />
                           </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='flex flex-col items-center justify-center py-20 text-muted-foreground text-center space-y-3 opacity-40'>
                      <ShoppingBasket className='h-12 w-12' />
                      <p className="font-bold text-sm">Your queue is currently empty.<br/>Select products to begin stocking.</p>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className='w-full h-14 text-lg font-black bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-2xl' 
                  disabled={loading || stockQueue.length === 0}
                >
                  {loading ? "COMMITTING..." : "COMMIT INVENTORY UPDATE"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className='mt-16 space-y-6'>
          <div className="flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-xl"><Layers className="h-5 w-5 text-primary" /></div>
             <h2 className='font-black text-xl uppercase tracking-tight'>Historical Records</h2>
          </div>
          <div className="overflow-hidden rounded-3xl border-2 border-muted shadow-sm">
            {stocks.length > 0 ? (
              <StockTable />
            ) : (
              <div className="p-20 text-center text-muted-foreground bg-muted/10 font-medium italic">No prior stocking history found.</div>
            )}
          </div>
        </div>
      </AdminFormContainer>
    </div>
  );
}
