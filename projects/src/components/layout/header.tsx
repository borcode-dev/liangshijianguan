'use client';

import { Bell, HelpCircle, User, ChevronDown, Shield, Building2, LogOut, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth, PRESET_ACCOUNTS } from '@/lib/auth';

export function Header() {
  const { user, switchAccount, logout } = useAuth();

  const handleSwitchAccount = (account: typeof PRESET_ACCOUNTS[0]) => {
    switchAccount({
      id: account.id,
      name: account.name,
      role: account.role,
      city: account.city,
      cityCode: account.cityCode,
    });
    window.location.href = '/liangshijianguan/';
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/liangshijianguan/login/';
  };

  const roleLabel = user?.role === 'city' ? '市级' : '省级';
  const roleColor = user?.role === 'city' ? 'bg-blue-500' : 'bg-amber-500';

  return (
    <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b bg-primary px-6 text-primary-foreground">
      {/* 左侧：Logo 和标题 */}
      <div className="flex items-center gap-2">
        <img
            src="/liangshijianguan/logo.png"
            alt="粮食安全监管系统"
            className="h-8 w-8 rounded-lg"
          />
        <span className="text-lg font-semibold">粮食安全监管系统</span>
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
                {user?.role === 'city' ? <Building2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </div>
              <span className="text-sm">{user?.name || '未登录'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span>{user?.name || '未登录'}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {user?.role === 'province' ? '省级管理员 · 全局监管' : `${user?.city || ''}管理员 · 属地管理`}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>个人中心</DropdownMenuItem>
            <DropdownMenuItem>修改密码</DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* 切换账号 */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <SwitchCamera className="h-4 w-4" />
                切换账号
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-52 max-h-80 overflow-y-auto">
                <DropdownMenuLabel className="text-xs text-muted-foreground">省级账号</DropdownMenuLabel>
                {PRESET_ACCOUNTS.filter(a => a.role === 'province').map(account => (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => handleSwitchAccount(account)}
                    className={user?.id === account.id ? 'bg-primary/10' : ''}
                  >
                    <Shield className="h-4 w-4 mr-2 text-amber-500" />
                    {account.name}
                    {user?.id === account.id && <Badge className="ml-auto text-xs" variant="outline">当前</Badge>}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">市级账号</DropdownMenuLabel>
                {PRESET_ACCOUNTS.filter(a => a.role === 'city').map(account => (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => handleSwitchAccount(account)}
                    className={user?.id === account.id ? 'bg-primary/10' : ''}
                  >
                    <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                    {account.name}
                    {user?.id === account.id && <Badge className="ml-auto text-xs" variant="outline">当前</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
