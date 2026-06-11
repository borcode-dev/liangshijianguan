'use client';

import { useState, useEffect } from 'react';

export function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <footer className="flex h-[32px] items-center justify-between border-t bg-card px-6 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>当前在线：<span className="font-medium text-foreground">56人</span></span>
        <span className="h-3 w-px bg-border" />
        <span>待处理任务：<span className="font-medium text-warning">12条</span></span>
      </div>
      <div className="flex items-center gap-4">
        <span>数据更新时间：2026-06-06 17:00</span>
        <span className="h-3 w-px bg-border" />
        <span>{formatDate(currentTime)}</span>
      </div>
    </footer>
  );
}
