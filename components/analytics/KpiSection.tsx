"use client";

import { useAnalytics } from "./hooks/useAnalytics";
import { KpiCard } from "./cards/KpiCard";
import { DollarSign, ShoppingCart, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiSectionProps {
    data?: any;
    isLoading?: boolean;
}

export function KpiSection({ data, isLoading }: KpiSectionProps) {
    if (isLoading && !data) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full h-24 animate-pulse bg-muted rounded-md" />;
    if (!data) return null;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                title="Total Revenue"
                value={`₦${data.totalRevenue.toLocaleString()}`}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
                title="Total Orders"
                value={data.totalOrders.toLocaleString()}
                icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
                title="Refunds"
                value={`₦${data.totalRefunds.toLocaleString()}`}
                icon={<ArrowDownRight className="h-4 w-4 text-red-500" />}
            />
            <KpiCard
                title="New Users"
                value={data.newUsers.toLocaleString()}
                description={`of ${data.totalUsers.toLocaleString()} total`}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
    );
}
