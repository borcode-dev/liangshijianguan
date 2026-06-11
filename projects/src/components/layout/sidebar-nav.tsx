'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Satellite,
  MapPin,
  TrendingUp,
  FileWarning,
  ClipboardCheck,
  CheckSquare,
  FileCheck,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Sprout,
  Users,
  Shield,
  Building2,
  FileText,
  Bell,
  FileSpreadsheet,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: '首页监管总览',
    href: '/',
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: '智能监测',
    icon: <Satellite className="h-4 w-4" />,
    children: [
      { title: '卫片监测', href: '/monitor/satellite', icon: <Satellite className="h-4 w-4" /> },
      { title: '变化图斑', href: '/monitor/spots', icon: <MapPin className="h-4 w-4" /> },
      { title: '长势分析', href: '/monitor/growth', icon: <TrendingUp className="h-4 w-4" /> },
    ],
  },
  {
    title: '事件管理',
    icon: <FileWarning className="h-4 w-4" />,
    children: [
      { title: '事件上报', href: '/events/report', icon: <FileWarning className="h-4 w-4" /> },
      { title: '事件核查', href: '/events/inspect', icon: <ClipboardCheck className="h-4 w-4" /> },
      { title: '事件处置', href: '/events/handle', icon: <CheckSquare className="h-4 w-4" /> },
    ],
  },
  {
    title: '闭环监管',
    icon: <FileCheck className="h-4 w-4" />,
    children: [
      { title: '任务下发', href: '/closed-loop/assign', icon: <FileCheck className="h-4 w-4" /> },
      { title: '核查管理', href: '/closed-loop/inspect', icon: <ClipboardCheck className="h-4 w-4" /> },
      { title: '整改管理', href: '/closed-loop/rectify', icon: <CheckSquare className="h-4 w-4" /> },
      { title: '结案审核', href: '/closed-loop/review', icon: <FileCheck className="h-4 w-4" /> },
    ],
  },
  {
    title: '巡查记录',
    icon: <ClipboardCheck className="h-4 w-4" />,
    children: [
      { title: '省级巡查抽查', href: '/system/patrol', icon: <ClipboardCheck className="h-4 w-4" /> },
      { title: '巡查报告查询', href: '/patrol/reports', icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    title: '统计分析',
    icon: <BarChart3 className="h-4 w-4" />,
    children: [
      { title: '监管统计', href: '/statistics', icon: <BarChart3 className="h-4 w-4" /> },
      { title: '报表管理', href: '/statistics/reports', icon: <FileSpreadsheet className="h-4 w-4" /> },
    ],
  },
  {
    title: '苗情监测',
    href: '/seedling',
    icon: <Sprout className="h-4 w-4" />,
  },
  {
    title: '系统管理',
    icon: <Settings className="h-4 w-4" />,
    children: [
      { title: '用户管理', href: '/system/users', icon: <Users className="h-4 w-4" /> },
      { title: '角色权限', href: '/system/roles', icon: <Shield className="h-4 w-4" /> },
      { title: '单位管理', href: '/system/units', icon: <Building2 className="h-4 w-4" /> },
      { title: '参数配置', href: '/system/config', icon: <Settings className="h-4 w-4" /> },
      { title: '操作日志', href: '/system/logs', icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    title: '消息中心',
    href: '/messages',
    icon: <Bell className="h-4 w-4" />,
  },
];

function NavItemComponent({ item, level = 0 }: { item: NavItem; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // 默认展开所有菜单
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === pathname;
  const isChildActive = item.children?.some(child => child.href === pathname);

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-primary/10 hover:text-primary',
            isChildActive && 'bg-primary/10 text-primary font-semibold'
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.title}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l border-border pl-2">
            {item.children!.map((child, index) => (
              <NavItemComponent key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-primary/10 hover:text-primary',
        isActive && 'bg-primary text-primary-foreground',
        level > 0 && 'text-muted-foreground hover:text-primary'
      )}
    >
      {item.icon}
      <span>{item.title}</span>
    </Link>
  );
}

export function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map((item, index) => (
        <NavItemComponent key={index} item={item} />
      ))}
    </nav>
  );
}
