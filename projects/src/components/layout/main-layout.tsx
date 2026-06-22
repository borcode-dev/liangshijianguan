'use client';

import { SidebarNav } from './sidebar-nav';
import { Header } from './header';
import { Footer } from './footer';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();

  // 登录页面不需要布局
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  // 未登录时显示登录引导
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#0A3A6B] via-[#1A5C9A] to-[#0A3A6B]">
        <div className="text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <svg viewBox="0 0 24 24" className="h-9 w-9 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.5 3.75L12 11.68 4.5 7.93 12 4.18zM4 9.08l7 3.5v7.42l-7-3.5V9.08zm16 0v7.42l-7 3.5v-7.42l7-3.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">粮食安全监管系统</h1>
          <p className="text-white/70 mb-6">请先登录系统</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[#1A5C9A] font-medium hover:bg-white/90 transition-colors"
          >
            进入登录页面
          </a>
        </div>
      </div>
    );
  }

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
