
import { getUserLunches } from "@/action/lunch"
import { LunchList } from "./lunch-list"
import { motion } from "framer-motion"

export const metadata = {
  title: "My Lunch | Succo",
  description: "Manage your lunch orders",
}

export default async function LunchPage() {
    const lunches = await getUserLunches()
    
    return (
        <div className="container mx-auto py-8 px-4 min-h-screen">
             <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Lunch & Events</h1>
                <p className="text-muted-foreground mt-2">
                    Create preset orders for your lunch breaks or events. Add items, save them, and order with one click.
                </p>
             </div>
             
             <LunchList initialLunches={lunches} />
        </div>
    )
}
