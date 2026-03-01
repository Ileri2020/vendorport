import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTableDemo } from "@/components/myComponents/subs/datatable";
import { CartDetailsDialog } from "@/components/myComponents/subs/CartDetailsDialog";
import { Trash2, Eye } from "lucide-react";

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
    e.stopPropagation(); // Prevent row click
    if (!confirm("Are you sure you want to delete this cart?")) return;
    try {
        await axios.delete(`/api/dbhandler?model=cart&id=${id}`);
        fetchCarts();
    } catch (err) {
        console.error("Failed to delete", err);
    }
  };

  const handleUpdatePayment = async () => {
      // Re-fetch carts to update status in table
      await fetchCarts();
      // Update the selected cart view
      if (selectedCart) {
          const updated = carts.find(c => c.id === selectedCart.id);
          if (updated) setSelectedCart(updated);
      }
      setDialogOpen(false); 
  }
  
  // Columns definition 
  const columns = useMemo(() => [
      {
          accessorKey: "id",
          header: "Order ID",
          cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.id.slice(-6)}</span>
      },
      {
          accessorKey: "user.email",
          header: "User",
          cell: ({ row }: any) => (
             <div className="flex flex-col">
                 <span className="font-medium text-xs">{row.original.user?.name || "Guest"}</span>
                 <span className="text-xs text-muted-foreground">{row.original.user?.email}</span>
             </div>
          )
      },
      {
          accessorKey: "total",
          header: "Total",
          cell: ({ row }: any) => <span className="font-bold">₦{row.original.total.toLocaleString()}</span>
      },
      {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }: any) => {
            const s = row.original.status;
            const color = s === 'paid' ? 'text-green-600' : s === 'unconfirmed' ? 'text-orange-500' : 'text-yellow-600';
            return <span className={`uppercase text-xs font-bold ${color}`}>{s}</span>
          }
      },
      {
          accessorKey: "createdAt",
          header: "Date",
          cell: ({ row }: any) => <span className="text-xs text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span>
      },
      {
          id: "actions",
          cell: ({ row }: any) => (
              <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedCart(row.original); setDialogOpen(true); }}>
                      <Eye className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, row.original.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
              </div>
          )
      }
  ], [carts]); 

  // Filter data
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
    <div className='w-full p-4 border rounded-md bg-card mx-2'>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h2 className='font-semibold text-lg'>All Carts Management</h2>
            <div className="flex gap-2 w-full md:w-auto">
                <Input 
                    placeholder="Search carts..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                <Button variant="outline" onClick={fetchCarts}>Refresh</Button>
            </div>
        </div>

        {loading ? (
            <div className="text-center py-10">Loading carts...</div>
        ) : (
            <DataTableDemo 
                columns={columns} 
                data={filteredData} 
                onRowClick={onRowClick}
            />
        )}

        <CartDetailsDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen}
            cart={selectedCart}
            onConfirmPayment={async () => {
               // The logic for confirming is actually inside the parent component or triggered via API. 
               // The Dialog calls 'onConfirmPayment'. 
               // I need to implement the API call here.
               if(!selectedCart) return;
               try {
                  await axios.put('/api/dbhandler?model=cart', {
                      id: selectedCart.id,
                      status: 'paid',
                      adminConfirmed: true
                  });
                  await handleUpdatePayment();
               } catch(e) {
                   console.error(e);
                   alert("Failed to confirm payment");
               }
            }}
        />
    </div>
  );
}

