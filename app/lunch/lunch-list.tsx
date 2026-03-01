"use client"

import { useState } from "react"
import { Cart, CartItem, Product } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { updateLunchItemQuantity, addLunchToCart, createLunch, renameLunch } from "@/action/lunch"
import { toast } from "sonner"
import { Trash2, ShoppingCart, Plus, Edit2, Check, X, ChevronDown, ChevronUp, Calendar, Clock, History, Calendar as CalendarIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { ScheduleLunchDialog } from "@/components/myComponents/subs/ScheduleLunchDialog"

type LunchWithProducts = Cart & {
    products: (CartItem & { product: Product })[]
}

interface LunchListProps {
    initialLunches: {
        templates: LunchWithProducts[],
        schedules: any[]
    }
}
export function LunchList({ initialLunches }: LunchListProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [newLunchName, setNewLunchName] = useState("")
    const [activeTab, setActiveTab] = useState<"templates" | "schedules">("templates")
    
    const handleCreate = async () => {
        if (!newLunchName.trim()) return
        try {
            const res = await createLunch(newLunchName)
            if (res.success) {
                toast.success("Lunch list created")
                setIsCreating(false)
                setNewLunchName("")
            } else {
                toast.error("Failed to create lunch list")
            }
        } catch (e) {
            toast.error("Error creating lunch")
        }
    }

    return (
        <div className="space-y-6">
             <div className="flex gap-4 border-b">
                <button 
                    className={cn("pb-2 px-4 transition-colors", activeTab === "templates" ? "border-b-2 border-primary font-bold" : "text-muted-foreground")}
                    onClick={() => setActiveTab("templates")}
                >
                    Saved Templates
                </button>
                <button 
                    className={cn("pb-2 px-4 transition-colors", activeTab === "schedules" ? "border-b-2 border-primary font-bold" : "text-muted-foreground")}
                    onClick={() => setActiveTab("schedules")}
                >
                    Active Schedules
                </button>
            </div>

            {activeTab === "templates" ? (
                <>
                    <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold">Your Saved Lunches</h2>
                        {!isCreating ? (
                            <Button onClick={() => setIsCreating(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Create New Template
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Input 
                                    value={newLunchName} 
                                    onChange={(e) => setNewLunchName(e.target.value)}
                                    placeholder="Lunch Name..."
                                    className="bg-background"
                                />
                                <Button size="icon" onClick={handleCreate}><Check className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => setIsCreating(false)}><X className="h-4 w-4" /></Button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {initialLunches.templates.map((lunch: any) => (
                            <LunchCard key={lunch.id} lunch={lunch} />
                        ))}
                    </div>
                    
                    {initialLunches.templates.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            You don't have any lunch templates yet. Create one or add products from the store!
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-4">
                     <div className="grid gap-4">
                        {initialLunches.schedules.map((schedule: any) => (
                            <Card key={schedule.id} className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{schedule.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                            <Badge variant="outline" className="capitalize">{schedule.frequency}</Badge>
                                            <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3"/> {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}</span>
                                            {schedule.daysOfWeek.length > 0 && <span className="flex items-center gap-1"><History className="h-3 w-3"/> {schedule.daysOfWeek.join(", ")}</span>}
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {schedule.timesInDay.join(", ")}</span>
                                        </div>
                                    </div>
                                    <Badge className={schedule.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>{schedule.status}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {schedule.carts?.length || 0} scheduled deliveries
                                </div>
                            </Card>
                        ))}
                        {initialLunches.schedules.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                                No active schedules. Schedule a template to see it here!
                            </div>
                        )}
                     </div>
                </div>
            )}
        </div>
    )
}

function LunchCard({ lunch }: { lunch: LunchWithProducts }) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [name, setName] = useState(lunch.name || "Untitled Lunch")
    const [isOpen, setIsOpen] = useState(false)
    const [loadingCart, setLoadingCart] = useState(false)
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)

    const handleUpdateName = async () => {
        if (name === lunch.name) {
            setIsEditingName(false)
            return
        }
        try {
            await renameLunch(lunch.id, name)
            setIsEditingName(false)
            toast.success("Renamed successfully")
        } catch {
            toast.error("Failed to rename")
        }
    }

    const handleAddToCart = async () => {
        setLoadingCart(true)
        try {
            const res = await addLunchToCart(lunch.id)
            if (res.success) {
                toast.success("All items added to your cart!")
            } else {
                toast.error("Failed to add to cart")
            }
        } catch {
            toast.error("Error adding to cart")
        } finally {
            setLoadingCart(false)
        }
    }

    const totalItems = lunch.products.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <Card className="overflow-hidden border-l-4 border-l-primary">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    {isEditingName ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" />
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUpdateName}>
                                <Check className="h-4 w-4 text-green-500" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                            <CardTitle className="text-lg line-clamp-1">{lunch.name || "Untitled Lunch"}</CardTitle>
                            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditingName(true)}>
                                <Edit2 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                    <Badge variant="secondary">{totalItems} items</Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground mb-4">
                    Updated {new Date(lunch.updatedAt).toLocaleDateString()}
                </div>
                
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                     <div className="flex flex-col gap-2">
                        {lunch.products.slice(0, isOpen ? undefined : 2).map((item) => (
                            <LunchItem key={item.id} item={item} />
                        ))}
                        
                        {lunch.products.length > 2 && !isOpen && (
                            <div className="text-xs text-center text-muted-foreground pt-1">
                                + {lunch.products.length - 2} more items
                            </div>
                        )}
                        
                        {lunch.products.length > 0 && (
                           <CollapsibleTrigger asChild>
                             <Button variant="ghost" size="sm" className="w-full mt-2 h-8 text-xs">
                                {isOpen ? <ChevronUp className="h-3 w-3 mr-1"/> : <ChevronDown className="h-3 w-3 mr-1"/>}
                                {isOpen ? "Show Less" : "Show All"}
                             </Button>
                           </CollapsibleTrigger>
                        )}
                     </div>
                </Collapsible>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-4 flex-col gap-2">
                <Button className="w-full" onClick={handleAddToCart} disabled={loadingCart || lunch.products.length === 0}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {loadingCart ? "Adding..." : "Order Now"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setIsScheduleDialogOpen(true)} disabled={lunch.products.length === 0}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Recurring
                </Button>
            </CardFooter>

            <ScheduleLunchDialog 
                isOpen={isScheduleDialogOpen} 
                onClose={() => setIsScheduleDialogOpen(false)} 
                templateId={lunch.id}
                templateName={lunch.name || "Untitled Lunch"}
            />
        </Card>
    )
}

function LunchItem({ item }: { item: CartItem & { product: Product } }) {
    const handleQuantityChange = async (delta: number) => {
        const newQty = item.quantity + delta
        try {
            await updateLunchItemQuantity(item.id, newQty)
        } catch {
            toast.error("Failed to update quantity")
        }
    }

    // Default image fallback
    const image = item.product.images?.[0] || "/placeholder.png"

    return (
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
            <div className="h-10 w-10 overflow-hidden rounded bg-muted flex-shrink-0">
                <img src={image} alt={item.product.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.product.name}</div>
                <div className="text-xs text-muted-foreground">₦{item.product.price}</div>
            </div>
            <div className="flex items-center gap-1 bg-background border rounded-md h-7">
                <button className="px-2 hover:bg-muted h-full" onClick={() => handleQuantityChange(-1)}>-</button>
                <span className="text-xs w-4 text-center">{item.quantity}</span>
                <button className="px-2 hover:bg-muted h-full" onClick={() => handleQuantityChange(1)}>+</button>
            </div>
        </div>
    )
}
