'use client';

import { useState } from 'react';
import { PageHeader, GrowthRatingBadge } from '@/components/shared';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import { growthAnalysis } from '@/lib/data/mock-data';
import { toast } from 'sonner';
import { Download, TrendingUp, TrendingDown, Minus, Leaf, BarChart3, MapPin } from 'lucide-react';

const DynamicLine = dynamic(
  () => import('react-chartjs-2').then((mod) => {
    const { Chart, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend, Title } = require('chart.js');
    Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend, Title);
    return mod.Line;
  }),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">图表加载中...</div> }
);

// 城市苗情详情
interface SeedlingCityDetail {
  city: string;
  index: number;
  trend: number;
  rating: string;
  monthlyData: number[];
  cropArea: number;
  growthStages: { stage: string; progress: number; status: string }[];
  counties: { name: string; index: number; trend: number; rating: string }[];
}

// 生成城市详情数据
function getCityDetail(city: string): SeedlingCityDetail {
  const base = growthAnalysis.find((c) => c.city === city);
  const index = base?.index || 0.78;
  const trend = base?.trend || 0;
  const rating = base?.rating || '中等';

  // 月度趋势数据
  const monthlyData = [
    index - 0.07, index - 0.04, index, index + 0.03, index + 0.01, index,
  ];

  // 作物面积
  const areaMap: Record<string, number> = {
    '芜湖市': 198,
    '滁州市': 298,
    '马鞍山市': 142,
    '蚌埠市': 245,
    '合肥市': 285,
    '阜阳市': 385,
  };
  const cropArea = areaMap[city] || 200;

  // 生育阶段
  const growthStages = [
    { stage: '播种期', progress: 100, status: '已完成' },
    { stage: '出苗期', progress: 100, status: '已完成' },
    { stage: '分蘖期', progress: 100, status: '已完成' },
    { stage: '拔节期', progress: 85, status: '进行中' },
    { stage: '抽穗期', progress: 30, status: '进行中' },
    { stage: '成熟期', progress: 0, status: '未开始' },
  ];

  // 区县数据
  const countyMap: Record<string, string[]> = {
    '芜湖市': ['鸠江区', '弋江区', '繁昌区', '南陵县', '无为市'],
    '滁州市': ['天长市', '明光市', '来安县', '定远县'],
    '马鞍山市': ['当涂县', '含山县', '和县', '花山区'],
    '蚌埠市': ['怀远县', '五河县', '固镇县', '龙子湖区'],
    '合肥市': ['肥东县', '肥西县', '长丰县', '庐江县', '巢湖市'],
    '阜阳市': ['临泉县', '太和县', '阜南县', '颍上县'],
  };
  const countyNames = countyMap[city] || ['区县A', '区县B', '区县C'];
  const counties = countyNames.map((name, i) => ({
    name,
    index: Math.max(0.5, index + (Math.random() - 0.5) * 0.15 - i * 0.02),
    trend: trend + (Math.random() - 0.5) * 4,
    rating: index > 0.8 ? (i < 2 ? '良好' : '中等') : (i < 1 ? '中等' : '偏差'),
  }));

  return { city, index, trend, rating, monthlyData, cropArea, growthStages, counties };
}

export default function SeedlingPage() {
  // 筛选状态
  const [filterYear, setFilterYear] = useState('2026');
  const [filterCrop, setFilterCrop] = useState('rice');
  const [filterRegion, setFilterRegion] = useState('all');

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<SeedlingCityDetail | null>(null);

  // 全省概览数据
  const provinceIndex = 0.82;
  const yoyChange = 5.3;
  const avgIndex = 0.78;

  // 折线图数据
  const chartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        label: '今年',
        data: [0.75, 0.78, 0.82, 0.85, 0.83, 0.82],
        borderColor: 'oklch(0.45 0.15 250)',
        backgroundColor: 'oklch(0.45 0.15 250 / 10%)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '去年',
        data: [0.72, 0.74, 0.76, 0.78, 0.79, 0.78],
        borderColor: 'oklch(0.7 0.18 135)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
      },
      {
        label: '常年均值',
        data: [0.76, 0.77, 0.78, 0.78, 0.78, 0.78],
        borderColor: 'oklch(0.5 0.01 260)',
        backgroundColor: 'transparent',
        borderDash: [2, 2],
        tension: 0.4,
      },
    ],
  };

  // 导出
  const handleExport = () => {
    toast.success('导出成功', { description: '苗情监测数据已导出' });
  };

  // 查看详情
  const handleViewDetail = (city: string) => {
    const detail = getCityDetail(city);
    setSelectedCity(detail);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="苗情监测"
        description="监测在地作物苗情长势，分析产量趋势"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        }
      />

      {/* 筛选条件 */}
      <div className="flex flex-wrap gap-4">
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="监测年度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2026">2026年</SelectItem>
            <SelectItem value="2025">2025年</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCrop} onValueChange={setFilterCrop}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="作物类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rice">水稻</SelectItem>
            <SelectItem value="wheat">小麦</SelectItem>
            <SelectItem value="corn">玉米</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="监测区域" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全省</SelectItem>
            <SelectItem value="bengbu">蚌埠市</SelectItem>
            <SelectItem value="fuyang">阜阳市</SelectItem>
            <SelectItem value="hefei">合肥市</SelectItem>
            <SelectItem value="wuhu">芜湖市</SelectItem>
            <SelectItem value="chuzhou">滁州市</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 长势指数概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">当前长势指数</p>
                <p className="text-3xl font-bold">{provinceIndex.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <Leaf className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              较上月 +0.02
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">同比变化</p>
                <p className="text-3xl font-bold">+{yoyChange}%</p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">好于去年</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">常年均值</p>
                <p className="text-3xl font-bold">{avgIndex.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Minus className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">高于常年</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">长势评级</p>
                <p className="text-3xl font-bold text-success">良好</p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">长势良好</p>
          </CardContent>
        </Card>
      </div>

      {/* 长势趋势图 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">长势对比分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <DynamicLine
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                scales: {
                  y: {
                    min: 0.6,
                    max: 0.9,
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 各市长势排名 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">各市长势排名</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {growthAnalysis.map((city, index) => (
              <div
                key={city.city}
                className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                onClick={() => handleViewDetail(city.city)}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                  index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{city.city}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">长势指数: {city.index}</span>
                      <div className={`flex items-center gap-1 text-sm ${
                        city.trend > 0 ? 'text-success' : city.trend < 0 ? 'text-destructive' : ''
                      }`}>
                        {city.trend > 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            +{city.trend}%
                          </>
                        ) : city.trend < 0 ? (
                          <>
                            <TrendingDown className="h-4 w-4" />
                            {city.trend}%
                          </>
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </div>
                      <Badge
                        variant={
                          city.rating === '优秀' || city.rating === '良好' ? 'default' :
                          city.rating === '中等' ? 'secondary' : 'destructive'
                        }
                      >
                        {city.rating}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${
                        city.rating === '优秀' ? 'bg-success' :
                        city.rating === '良好' ? 'bg-primary' :
                        city.rating === '中等' ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${city.index * 100}%` }}
                    />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetail(city.city); }}>
                  查看详情
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 产量形势研判 */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">产量形势研判</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="default">综合研判</Badge>
            <p className="text-sm">全省夏粮长势总体良好，预计产量较去年增长3-5%</p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">关注区域</Badge>
            <p className="text-sm">阜阳、宿州部分地区因干旱导致长势偏差，需加强田管</p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="border-blue-500 text-blue-600">建议措施</Badge>
            <p className="text-sm">对长势偏差区域增施穗肥，提高结实率</p>
          </div>
        </CardContent>
      </Card>

      {/* 城市苗情详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {selectedCity?.city} - 苗情监测详情
            </DialogTitle>
            <DialogDescription>
              查看该地区详细的苗情长势监测数据
            </DialogDescription>
          </DialogHeader>

          {selectedCity && (
            <div className="space-y-4">
              {/* 基本指标 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">长势指数</div>
                  <div className="text-2xl font-bold">{selectedCity.index.toFixed(2)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">同比变化</div>
                  <div className={`text-2xl font-bold ${selectedCity.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {selectedCity.trend >= 0 ? '+' : ''}{selectedCity.trend}%
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">长势评级</div>
                  <div className="mt-1">
                    <GrowthRatingBadge rating={selectedCity.rating as '优秀' | '良好' | '中等' | '较差' | '差'} />
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">监测面积</div>
                  <div className="text-2xl font-bold">{selectedCity.cropArea}万亩</div>
                </div>
              </div>

              <Separator />

              {/* 月度趋势图 */}
              <div className="space-y-2">
                <div className="text-sm font-medium">月度长势趋势</div>
                <div className="h-[200px]">
                  <DynamicLine
                    data={{
                      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                      datasets: [
                        {
                          label: selectedCity.city,
                          data: selectedCity.monthlyData,
                          borderColor: 'oklch(0.45 0.15 250)',
                          backgroundColor: 'oklch(0.45 0.15 250 / 10%)',
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: '全省均值',
                          data: [0.75, 0.78, 0.82, 0.85, 0.83, 0.82],
                          borderColor: 'oklch(0.7 0.18 135)',
                          backgroundColor: 'transparent',
                          borderDash: [5, 5],
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                      scales: {
                        y: {
                          min: 0.5,
                          max: 1.0,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <Separator />

              {/* 生育阶段 */}
              <div className="space-y-2">
                <div className="text-sm font-medium">作物生育阶段</div>
                <div className="space-y-2">
                  {selectedCity.growthStages.map((stage) => (
                    <div key={stage.stage} className="flex items-center gap-3">
                      <span className="w-20 text-sm">{stage.stage}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            stage.progress === 100
                              ? 'bg-success'
                              : stage.progress > 0
                              ? 'bg-primary'
                              : 'bg-muted-foreground/30'
                          }`}
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                      <span className={`w-16 text-right text-xs ${
                        stage.progress === 100
                          ? 'text-success'
                          : stage.progress > 0
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 区县排名 */}
              <div className="space-y-2">
                <div className="text-sm font-medium">区县长势排名</div>
                <div className="space-y-2">
                  {selectedCity.counties.map((county, i) => (
                    <div key={county.name} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          i < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-medium">{county.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">指数: {county.index.toFixed(2)}</span>
                        <span className={`text-sm ${county.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {county.trend >= 0 ? '+' : ''}{county.trend.toFixed(1)}%
                        </span>
                        <GrowthRatingBadge rating={county.rating as '优秀' | '良好' | '中等' | '较差' | '差'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
