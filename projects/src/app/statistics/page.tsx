'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader, ProgressBar } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ChartPie, ChartLine } from '@/components/shared/charts';
import {
  problemTypeDistribution,
  monthlyTrend,
  cityRankings,
} from '@/lib/data/mock-data';
import { useCityFilter, filterByCityWithCity } from '@/lib/data/filter';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import {
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Lightbulb,
} from 'lucide-react';

// 饼图颜色映射
const pieColors = [
  'rgba(26, 92, 154, 0.8)',
  'rgba(234, 179, 8, 0.8)',
  'rgba(249, 115, 22, 0.8)',
  'rgba(34, 197, 94, 0.8)',
  'rgba(107, 114, 128, 0.8)',
];

const pieBorderColors = [
  'rgba(26, 92, 154, 1)',
  'rgba(234, 179, 8, 1)',
  'rgba(249, 115, 22, 1)',
  'rgba(34, 197, 94, 1)',
  'rgba(107, 114, 128, 1)',
];

export default function StatisticsPage() {
  const userCity = useCityFilter();
  const { locationText } = useAuth();
  const [filterYear, setFilterYear] = useState('2026');
  const [filterType, setFilterType] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');

  // 按城市过滤
  const filteredCityRankings = userCity ? cityRankings.filter(c => c.city === userCity) : cityRankings;

  // 饼图数据
  const pieData = {
    labels: problemTypeDistribution.map((d) => d.name),
    datasets: [
      {
        data: problemTypeDistribution.map((d) => d.value),
        backgroundColor: pieColors,
        borderColor: pieBorderColors,
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { label: string; parsed: number }) => {
            const total = context.parsed;
            return `${context.label}: ${total}%`;
          },
        },
      },
    },
  };

  // 折线图数据
  const lineData = {
    labels: monthlyTrend.map((d) => d.month),
    datasets: [
      {
        label: '本月新增',
        data: monthlyTrend.map((d) => d.newSpots),
        borderColor: 'rgba(26, 92, 154, 1)',
        backgroundColor: 'rgba(26, 92, 154, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: '本月结案',
        data: monthlyTrend.map((d) => d.closedSpots),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          font: { size: 12 },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // 查看城市详情
  const handleViewDetail = (city: string) => {
    setSelectedCity(city);
    setDetailOpen(true);
  };

  // 导出
  const handleExport = () => {
    toast.success('导出成功', { description: '统计数据已导出为Excel文件' });
  };

  // 打印
  const handlePrint = () => {
    toast.success('打印任务已发送', { description: '请在打印机处查收' });
  };

  // 定制报表
  const handleCustomReport = () => {
    toast.success('报表定制请求已提交', { description: '系统将在1个工作日内生成定制报表' });
  };

  // 获取当前选中城市的详情数据
  const selectedCityData = filteredCityRankings.find((c) => c.city === selectedCity);

  return (
    <div className="space-y-6">
      <PageHeader
        title="监管统计分析"
        description="提供多维度的粮食安全监管统计分析，支持趋势分析、区域对比和报表导出"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              打印
            </Button>
            <Button onClick={handleCustomReport}>定制报表</Button>
          </div>
        }
      />

      {/* 筛选条件 */}
      <div className="flex flex-wrap gap-4">
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="统计年度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2026">2026年</SelectItem>
            <SelectItem value="2025">2025年</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="问题类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="撂荒">撂荒</SelectItem>
            <SelectItem value="割青毁粮">割青毁粮</SelectItem>
            <SelectItem value="非粮化">非粮化</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="地区范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全省</SelectItem>
            <SelectItem value="合肥市">合肥市</SelectItem>
            <SelectItem value="芜湖市">芜湖市</SelectItem>
            <SelectItem value="蚌埠市">蚌埠市</SelectItem>
            <SelectItem value="淮南市">淮南市</SelectItem>
            <SelectItem value="马鞍山市">马鞍山市</SelectItem>
            <SelectItem value="淮北市">淮北市</SelectItem>
            <SelectItem value="铜陵市">铜陵市</SelectItem>
            <SelectItem value="安庆市">安庆市</SelectItem>
            <SelectItem value="黄山市">黄山市</SelectItem>
            <SelectItem value="滁州市">滁州市</SelectItem>
            <SelectItem value="阜阳市">阜阳市</SelectItem>
            <SelectItem value="宿州市">宿州市</SelectItem>
            <SelectItem value="六安市">六安市</SelectItem>
            <SelectItem value="亳州市">亳州市</SelectItem>
            <SelectItem value="池州市">池州市</SelectItem>
            <SelectItem value="宣城市">宣城市</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 核心指标 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本月新增图斑</p>
                <p className="text-3xl font-bold">89个</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              +23个
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本月结案数</p>
                <p className="text-3xl font-bold">56个</p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              +15个
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均处置周期</p>
                <p className="text-3xl font-bold">12.5天</p>
              </div>
              <div className="rounded-full bg-info/10 p-3">
                <BarChart3 className="h-6 w-6 text-info" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-success">
              <TrendingDown className="h-4 w-4" />
              缩短2.3天
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">超期未结案</p>
                <p className="text-3xl font-bold text-destructive">8个</p>
              </div>
              <div className="rounded-full bg-destructive/10 p-3">
                <BarChart3 className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-success">
              <TrendingDown className="h-4 w-4" />
              -5个
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-5 w-5" />
              问题类型分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center" style={{ maxHeight: '350px' }}>
              <ChartPie data={pieData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart className="h-5 w-5" />
              月度趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center" style={{ maxHeight: '350px' }}>
              <ChartLine data={lineData} options={lineOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 各市处置效率对比 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">各市处置效率对比</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>地区</TableHead>
                <TableHead>图斑数</TableHead>
                <TableHead>结案数</TableHead>
                <TableHead>结案率</TableHead>
                <TableHead>平均周期</TableHead>
                <TableHead>排名</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCityRankings.map((row, index) => (
                <TableRow key={row.city}>
                  <TableCell className="font-medium">{row.city}</TableCell>
                  <TableCell>{row.spotCount}</TableCell>
                  <TableCell>{row.closedCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <ProgressBar value={row.closeRate} />
                      </div>
                      <span className={row.closeRate >= 90 ? 'text-success' : row.closeRate >= 80 ? '' : 'text-destructive'}>
                        {row.closeRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{row.avgDays}天</TableCell>
                  <TableCell>
                    <Badge variant={index < 3 ? 'default' : 'secondary'}>
                      {row.rank}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetail(row.city)}>
                      详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 建议卡片 */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <p className="text-sm">
            <span className="font-medium">建议：</span>
            宿州市、阜阳市平均处置周期较长，建议加强人员配置和流程优化
          </p>
        </CardContent>
      </Card>

      {/* 城市详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCity} - 监管统计详情</DialogTitle>
            <DialogDescription>查看该地区的详细监管统计数据</DialogDescription>
          </DialogHeader>
          {selectedCityData && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold">{selectedCityData.spotCount}</div>
                    <div className="text-sm text-muted-foreground">图斑总数</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-success">{selectedCityData.closedCount}</div>
                    <div className="text-sm text-muted-foreground">结案数</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold">{selectedCityData.closeRate}%</div>
                    <div className="text-sm text-muted-foreground">结案率</div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">平均处置周期</div>
                  <div className="text-xl font-bold">{selectedCityData.avgDays}天</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">全省排名</div>
                  <div className="text-xl font-bold">第{selectedCityData.rank}名</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">结案率</div>
                <ProgressBar value={selectedCityData.closeRate} showLabel />
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                <p>
                  <span className="font-medium">分析：</span>
                  {selectedCityData.closeRate >= 90
                    ? `${selectedCity}结案率较高，处置效率良好，继续保持。`
                    : selectedCityData.closeRate >= 80
                    ? `${selectedCity}结案率处于中等水平，建议优化处置流程。`
                    : `${selectedCity}结案率偏低，建议加强人员配置和流程优化，重点关注超期未结案件。`}
                </p>
                <p>
                  <span className="font-medium">建议：</span>
                  {selectedCityData.avgDays > 15
                    ? '平均处置周期较长，建议增加核查人员，优化任务分配机制。'
                    : '平均处置周期在合理范围内，建议持续关注并优化。'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
