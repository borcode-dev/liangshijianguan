'use client';

import { SidebarNav } from './sidebar-nav';
import { Header } from './header';
import { Footer } from './footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* 顶部导航 */}
      <Header />

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧菜单 */}
        <aside className="w-[220px] flex-shrink-0 overflow-y-auto bg-white border-r border-border">
          <SidebarNav />
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="min-h-full p-6">
            {children}
          </div>
        </main>
      </div>

      {/* 底部状态栏 */}
      <Footer />
    </div>
  );
}
