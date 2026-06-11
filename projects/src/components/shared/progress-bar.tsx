'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  indicatorClassName,
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative w-full overflow-hidden rounded-full bg-muted', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full bg-primary transition-all duration-300', indicatorClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

interface ProcessStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
}

interface ProcessProgressProps {
  steps: ProcessStep[];
  className?: string;
}

export function ProcessProgress({ steps, className }: ProcessProgressProps) {
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const currentIndex = steps.findIndex(s => s.status === 'current');

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                step.status === 'completed' && 'bg-primary text-primary-foreground',
                step.status === 'current' && 'border-2 border-primary bg-background text-primary',
                step.status === 'pending' && 'border-2 border-muted bg-background text-muted-foreground'
              )}
            >
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            <p
              className={cn(
                'mt-2 text-xs',
                step.status === 'completed' && 'text-foreground',
                step.status === 'current' && 'text-primary font-medium',
                step.status === 'pending' && 'text-muted-foreground'
              )}
            >
              {step.label}
            </p>
            {step.date && (
              <p className="text-xs text-muted-foreground">{step.date}</p>
            )}
          </div>
        ))}
      </div>
      <div className="relative h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(completedCount / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
