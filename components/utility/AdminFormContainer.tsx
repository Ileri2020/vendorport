import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdminFormContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminFormContainer({
  title,
  description,
  children,
  className,
}: AdminFormContainerProps) {
  return (
    <Card className={cn("w-full border-none shadow-none md:border md:shadow-sm overflow-hidden", className)}>
      <CardHeader className="px-4 py-6 md:px-6">
        <CardTitle className="text-xl font-bold tracking-tight md:text-2xl">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-8 md:px-6">
        {children}
      </CardContent>
    </Card>
  );
}
