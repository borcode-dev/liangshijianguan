'use client';

import { Bell, HelpCircle, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b bg-primary px-6 text-primary-foreground">
      {/* 左侧：Logo 和标题 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.5 3.75L12 11.68 4.5 7.93 12 4.18zM4 9.08l7 3.5v7.42l-7-3.5V9.08zm16 0v7.42l-7 3.5v-7.42l7-3.5z" />
            </svg>
          </div>
          <span className="text-lg font-semibold">粮食安全监管系统</span>
        </div>
        <div className="h-5 w-px bg-white/20" />
        <span className="text-sm text-white/80">当前位置：安徽省</span>
      </div>

      {/* 右侧：消息、帮助、用户 */}
      <div className="flex items-center gap-2">
        {/* 消息通知 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-white/10">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-destructive p-0 text-xs">
                8
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              消息中心
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                全部已读
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-60 overflow-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs text-warning">待办</span>
                  <span className="text-sm">图斑TB-001待核查</span>
                </div>
                <span className="text-xs text-muted-foreground">2026-06-05</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-xs text-destructive">预警</span>
                  <span className="text-sm">图斑TB-003即将超期（剩余1天）</span>
                </div>
                <span className="text-xs text-muted-foreground">2026-06-06</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-info/20 px-1.5 py-0.5 text-xs text-info">通知</span>
                  <span className="text-sm">巡查记录XC-001已提交</span>
                </div>
                <span className="text-xs text-muted-foreground">2026-06-05</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-primary">
              查看全部消息
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 帮助 */}
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* 用户菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-primary-foreground hover:bg-white/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm">省级管理员</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>个人中心</DropdownMenuItem>
            <DropdownMenuItem>修改密码</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">退出登录</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
