'use client';

import { useState } from 'react';
import { PageHeader, AlertDetailDialog } from '@/components/shared';
import { StatCard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  homeStatistics,
  alerts,
  citySpotDistribution,
  spotProcessProgress,
} from '@/lib/data/mock-data';
import {
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Clock,
  RefreshCw,
  Maximize2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Link from 'next/link';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

export default function HomePage() {
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<{
    id: string;
    type: string;
    level: string;
    message: string;
    time: string;
    location: string;
  } | null>(null);

  const handleAlertClick = (alert: typeof alerts[0]) => {
    setSelectedAlert({
      id: alert.id,
      type: alert.type === 'danger' ? '高风险预警' : '超期预警',
      level: alert.type === 'danger' ? 'high' : 'medium',
      message: alert.message,
      time: '2026-06-06 14:30',
      location: '蚌埠市怀远县龙亢镇',
    });
    setShowAlertDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="粮食安全监管首页"
        description="当前层级：安徽省 | 数据更新时间：2026-06-06 17:00"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="mr-2 h-4 w-4" />
              全屏
            </Button>
          </div>
        }
      />

      {/* 核心指标卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="疑似图斑总数"
          value={homeStatistics.totalSpots.toLocaleString() + '个'}
          trend={{
            value: homeStatistics.newThisMonth,
            label: '本月新增',
            type: 'up',
          }}
          icon={<MapPin className="h-5 w-5" />}
        />
        <StatCard
          title="待核查图斑"
          value={homeStatistics.pendingCheck.toLocaleString() + '个'}
          trend={{
            value: Math.round((homeStatistics.pendingCheck / homeStatistics.totalSpots) * 100),
            label: '%',
            type: 'neutral',
          }}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="整改中事件"
          value={homeStatistics.rectifying.toLocaleString() + '个'}
          trend={{
            value: Math.round((homeStatistics.rectifying / homeStatistics.totalSpots) * 100),
            label: '%',
            type: 'neutral',
          }}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          title="本月结案数"
          value={homeStatistics.closedThisMonth.toLocaleString() + '个'}
          trend={{
            value: homeStatistics.closedThisMonth,
            label: '已完成',
            type: 'up',
          }}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* 紧急预警 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            紧急预警
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={
                    alert.type === 'danger'
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : 'border-warning bg-warning/10 text-warning'
                  }
                >
                  {alert.type === 'danger' ? '紧急' : '警告'}
                </Badge>
                <span className="text-sm">{alert.message}</span>
              </div>
              <Button variant="link" size="sm" className="text-primary">
                {alert.action}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 图表区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 图斑处置进度 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">图斑处置进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <Pie
                data={{
                  labels: spotProcessProgress.map((item) => item.name),
                  datasets: [
                    {
                      data: spotProcessProgress.map((item) => item.value),
                      backgroundColor: [
                        'oklch(0.7 0.18 135)',
                        'oklch(0.78 0.14 75)',
                        'oklch(0.7 0.15 250)',
                      ],
                      borderColor: [
                        'oklch(0.65 0.16 135)',
                        'oklch(0.73 0.12 75)',
                        'oklch(0.65 0.13 250)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          return `${context.label}: ${context.parsed}%`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 各市图斑分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">各市图斑分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <Bar
                data={{
                  labels: citySpotDistribution.slice(0, 7).map((item) => item.city),
                  datasets: [
                    {
                      label: '图斑数量',
                      data: citySpotDistribution.slice(0, 7).map((item) => item.count),
                      backgroundColor: 'oklch(0.45 0.15 250)',
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'oklch(0.91 0.005 260)',
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 今日待办 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            今日待办
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm">待核查任务：</span>
              <span className="font-bold text-warning">8条</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm">待审核任务：</span>
              <span className="font-bold text-primary">3条</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">待整改任务：</span>
              <span className="font-bold">5条</span>
            </div>
            <Button variant="link" size="sm" className="ml-auto text-primary" asChild>
              <Link href="/closed-loop/inspect">
                查看全部待办
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 预警详情弹窗 */}
      <AlertDetailDialog
        open={showAlertDialog}
        onOpenChange={setShowAlertDialog}
        alert={selectedAlert}
      />
    </div>
  );
}
