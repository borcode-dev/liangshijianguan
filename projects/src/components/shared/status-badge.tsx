'use client';

import { cn } from '@/lib/utils';
import type { SpotStatus, EventStatus, RiskLevel, ProblemType } from '@/types';

interface StatusBadgeProps {
  status: SpotStatus | EventStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // 图斑状态
  '待下发': { label: '待下发', className: 'bg-muted text-muted-foreground' },
  '待核查': { label: '待核查', className: 'bg-info/10 text-info' },
  '核查中': { label: '核查中', className: 'bg-info/10 text-info' },
  '待上报': { label: '待上报', className: 'bg-warning/10 text-warning' },
  '待审核': { label: '待审核', className: 'bg-warning/10 text-warning' },
  '整改中': { label: '整改中', className: 'bg-warning/10 text-warning' },
  '待验收': { label: '待验收', className: 'bg-warning/10 text-warning' },
  '已结案': { label: '已结案', className: 'bg-success/10 text-success' },
  '需复查': { label: '需复查', className: 'bg-destructive/10 text-destructive' },
  // 事件状态
  '待受理': { label: '待受理', className: 'bg-muted text-muted-foreground' },
  '已驳回': { label: '已驳回', className: 'bg-destructive/10 text-destructive' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  high: { label: '高风险', className: 'bg-destructive/10 text-destructive' },
  medium: { label: '中风险', className: 'bg-warning/10 text-warning' },
  low: { label: '低风险', className: 'bg-success/10 text-success' },
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskConfig[level];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface ProblemTypeBadgeProps {
  type: ProblemType;
  className?: string;
}

export function ProblemTypeBadge({ type, className }: ProblemTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-xs',
        className
      )}
    >
      {type}
    </span>
  );
}

interface GrowthRatingBadgeProps {
  rating: '优秀' | '良好' | '中等' | '较差' | '差' | '偏差';
  className?: string;
}

const growthRatingConfig: Record<string, { className: string }> = {
  '优秀': { className: 'bg-green-100 text-green-700' },
  '良好': { className: 'bg-success/10 text-success' },
  '中等': { className: 'bg-warning/10 text-warning' },
  '较差': { className: 'bg-orange-100 text-orange-700' },
  '差': { className: 'bg-destructive/10 text-destructive' },
  '偏差': { className: 'bg-destructive/10 text-destructive' },
};

export function GrowthRatingBadge({ rating, className }: GrowthRatingBadgeProps) {
  const config = growthRatingConfig[rating];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {rating}
    </span>
  );
}
