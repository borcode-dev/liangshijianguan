'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
    type: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, trend, icon, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                {trend.type === 'up' && (
                  <ArrowUp className="h-4 w-4 text-success" />
                )}
                {trend.type === 'down' && (
                  <ArrowDown className="h-4 w-4 text-destructive" />
                )}
                {trend.type === 'neutral' && (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    trend.type === 'up' && 'text-success',
                    trend.type === 'down' && 'text-destructive',
                    trend.type === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {trend.value > 0 && '+'}
                  {trend.value}
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardSimpleProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export function StatCardSimple({ title, value, subtitle, className }: StatCardSimpleProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
