"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import AnalyticsDashboard from '@/app/admin/analytics/page'
import axios from 'axios'
import { Skeleton } from '@/components/ui/skeleton'

export default function StoreAnalyticsPage() {
  const { storeName } = useParams()
  const [business, setBusiness] = useState<any>(null)

  useEffect(() => {
    // Fetch business to get ID
    axios.get('/api/dbhandler?model=business').then(res => {
       const biz = res.data.find((b: any) => b.name.toLowerCase().replace(/\s+/g, '-') === storeName)
       setBusiness(biz)
    })
  }, [storeName])

   if (!business) return (
      <div className="p-20 flex flex-col items-center justify-center">
         <Skeleton className="h-10 w-10 rounded-full bg-muted/40 mb-4" />
         <Skeleton className="h-6 w-[220px] bg-muted/30 mb-2" />
         <p className="text-center font-black animate-pulse">Loading Store Insights...</p>
      </div>
   );

  return (
    <div className="min-h-screen bg-background">
       <div className="bg-accent p-6 text-white text-center">
          <h1 className="text-2xl font-black uppercase tracking-tighter">{business.name} Analytics</h1>
          <p className="text-xs opacity-70">Deep dive into your store's performance</p>
       </div>
       <div className="p-4 md:p-8">
          <AnalyticsDashboard businessId={business.id} />
       </div>
    </div>
  )
}
