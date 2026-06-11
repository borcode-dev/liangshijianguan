import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: {
    default: '粮食安全监管系统',
    template: '%s | 粮食安全监管系统',
  },
  description: '安徽省粮食安全监测监管信息系统 - 粮食安全监管分系统，面向省、市、县三级农业执法人员，实现粮食安全事件的智能发现、核查处置和闭环监管。',
  keywords: [
    '粮食安全',
    '监管系统',
    '农业执法',
    '遥感监测',
    '图斑管理',
    '安徽省',
  ],
  authors: [{ name: '安徽省农业农村厅' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
