import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTableDemo } from "@/components/myComponents/subs/datatable";
import { CartDetailsDialog } from "@/components/myComponents/subs/CartDetailsDialog";
import { Trash2, Eye } from "lucide-react";

import { AdminFormContainer } from '@/components/utility/AdminFormContainer';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, RefreshCcw, Search as SearchIcon } from "lucide-react";

export default function CartForm() {
  const [carts, setCarts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCart, setSelectedCart] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    setLoading(true);
    try {
        const res = await axios.get('/api/dbhandler?model=cart');
        setCarts(res.data);
    } catch(err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this cart?")) return;
    try {
        await axios.delete(`/api/dbhandler?model=cart&id=${id}`);
        fetchCarts();
    } catch (err) {
        console.error("Failed to delete", err);
    }
  };

  const handleUpdatePayment = async () => {
      await fetchCarts();
      if (selectedCart) {
          const updated = carts.find(c => c.id === selectedCart.id);
          if (updated) setSelectedCart(updated);
      }
      setDialogOpen(false); 
  }
  
  const columns = useMemo(() => [
      {
          accessorKey: "id",
          header: "Order ID",
          cell: ({ row }: any) => <span className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground">{row.original.id.slice(-6)}</span>
      },
      {
          accessorKey: "user.email",
          header: "Customer",
          cell: ({ row }: any) => (
             <div className="flex flex-col">
                 <span className="font-black text-xs uppercase tracking-tight">{row.original.user?.name || "Guest User"}</span>
                 <span className="text-[10px] text-muted-foreground font-medium">{row.original.user?.email}</span>
             </div>
          )
      },
      {
          accessorKey: "total",
          header: "Amount",
          cell: ({ row }: any) => <span className="font-black text-sm text-accent">₦{row.original.total.toLocaleString()}</span>
      },
      {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }: any) => {
            const s = row.original.status;
            let variant: any = "secondary";
            if (s === 'paid') variant = "default";
            if (s === 'unconfirmed') variant = "outline";
            
            return (
              <Badge variant={variant} className={cn(
                "uppercase text-[9px] font-black tracking-widest",
                s === 'paid' ? "bg-green-500 hover:bg-green-600" : s === 'unconfirmed' ? "border-orange-500 text-orange-500" : ""
              )}>
                {s}
              </Badge>
            )
          }
      },
      {
          accessorKey: "createdAt",
          header: "Date",
          cell: ({ row }: any) => <span className="text-[10px] font-bold uppercase text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span>
      },
      {
          id: "actions",
          cell: ({ row }: any) => (
              <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10 hover:text-accent" onClick={(e) => { e.stopPropagation(); setSelectedCart(row.original); setDialogOpen(true); }}>
                      <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDelete(e, row.original.id)}>
                      <Trash2 className="w-4 h-4" />
                  </Button>
              </div>
          )
      }
  ], [carts]); 

  const filteredData = useMemo(() => {
      if (!search) return carts;
      const lower = search.toLowerCase();
      return carts.filter(c => 
          c.id?.toLowerCase().includes(lower) || 
          c.user?.name?.toLowerCase().includes(lower) || 
          c.user?.email?.toLowerCase().includes(lower) ||
          c.status?.toLowerCase().includes(lower)
      );
  }, [carts, search]);

  const onRowClick = (row: any) => {
      setSelectedCart(row);
      setDialogOpen(true);
  }

  return (
    <div className='w-full max-w-6xl mx-auto'>
      <AdminFormContainer 
        title="Order History" 
        description="Monitor and process customer transactions and pending payments."
      >
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-8 gap-4">
            <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by ID, name, or email..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 pl-10 rounded-2xl border-2"
                />
            </div>
            <Button variant="outline" onClick={fetchCarts} className="h-11 rounded-2xl border-2 font-black text-xs uppercase tracking-widest gap-2">
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              Sync Orders
            </Button>
        </div>

        <div className="bg-card rounded-[2.5rem] border-2 border-muted overflow-hidden shadow-sm">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <div className="h-12 w-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">Retrieving Transaction Data...</p>
                </div>
            ) : filteredData.length > 0 ? (
                <DataTableDemo 
                    columns={columns} 
                    data={filteredData} 
                    onRowClick={onRowClick}
                />
            ) : (
                <div className="py-20 text-center flex flex-col items-center space-y-4">
                   <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center">
                     <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                   </div>
                   <p className="text-muted-foreground font-medium">No order records found.</p>
                </div>
            )}
        </div>

        <CartDetailsDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen}
            cart={selectedCart}
            onConfirmPayment={async () => {
               if(!selectedCart) return;
               try {
                  toast.loading("Confirming payment...");
                  await axios.put('/api/dbhandler?model=cart', {
                      id: selectedCart.id,
                      status: 'paid',
                      adminConfirmed: true
                  });
                  toast.success("Transaction confirmed");
                  await handleUpdatePayment();
               } catch(e) {
                   console.error(e);
                   toast.error("Failed to confirm payment");
               }
            }}
        />
      </AdminFormContainer>
    </div>
  );
}

import { cn } from '@/lib/utils';

