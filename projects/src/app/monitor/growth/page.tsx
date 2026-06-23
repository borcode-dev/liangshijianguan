'use client';

import { useState } from 'react';
import { PageHeader, StatCard, GrowthRatingBadge } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import { ChartLine } from '@/components/shared/charts';
import { cityGrowthData } from '@/lib/data/growth-data';
import { growthData } from '@/lib/data/mock-data';
import { useCityFilter } from '@/lib/data/filter';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Download, TrendingUp, TrendingDown, BarChart2, MapPin } from 'lucide-react';

const DynamicDrillDownGrowthMap = dynamic(
  () => import('@/components/map/drill-down-growth-map').then((mod) => mod.DrillDownGrowthMap),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">地图加载中...</div> }
);

// 城市详情数据
interface CityGrowthDetail {
  name: string;
  index: number;
  yoyChange: number;
  rating: string;
  area: number;
  monthlyData: number[];
  topCounties: { name: string; index: number; rating: string }[];
}

// 生成城市详情
function getCityDetail(item: typeof cityGrowthData[0]): CityGrowthDetail {
  const ratingMap: Record<string, string> = {
    excellent: '优秀',
    good: '良好',
    medium: '中等',
    poor: '较差',
    bad: '差',
  };

  // 模拟月度数据
  const base = item.index;
  const monthlyData = [
    base - 0.07, base - 0.04, base, base + 0.03, base + 0.01, base,
  ];

  // 模拟区县数据
  const countyNames: Record<string, string[]> = {
    '合肥市': ['肥东县', '肥西县', '长丰县', '庐江县', '巢湖市'],
    '芜湖市': ['鸠江区', '弋江区', '繁昌区', '南陵县', '无为市'],
    '蚌埠市': ['怀远县', '五河县', '固镇县', '龙子湖区', '禹会区'],
    '淮南市': ['凤台县', '寿县', '大通区', '田家庵区'],
    '马鞍山市': ['当涂县', '含山县', '和县', '花山区'],
    '淮北市': ['濉溪县', '相山区', '烈山区'],
    '铜陵市': ['枞阳县', '义安区', '郊区'],
    '安庆市': ['怀宁县', '太湖县', '宿松县', '望江县'],
    '黄山市': ['歙县', '休宁县', '祁门县', '黟县'],
    '滁州市': ['天长市', '明光市', '来安县', '定远县'],
    '阜阳市': ['临泉县', '太和县', '阜南县', '颍上县'],
    '宿州市': ['砀山县', '萧县', '灵璧县', '泗县'],
    '六安市': ['霍邱县', '舒城县', '金寨县', '霍山县'],
    '亳州市': ['涡阳县', '蒙城县', '利辛县'],
    '池州市': ['东至县', '石台县', '青阳县'],
    '宣城市': ['郎溪县', '泾县', '绩溪县', '旌德县'],
  };

  const names = countyNames[item.name] || ['区县A', '区县B', '区县C'];
  const topCounties = names.map((name, i) => ({
    name,
    index: Math.max(0.5, item.index + (Math.random() - 0.5) * 0.15 - i * 0.02),
    rating: item.index > 0.8 ? (i < 2 ? '良好' : '中等') : (i < 1 ? '中等' : '较差'),
  }));

  return {
    name: item.name,
    index: item.index,
    yoyChange: item.yoyChange,
    rating: ratingMap[item.rating] || '中等',
    area: item.area,
    monthlyData,
    topCounties,
  };
}

export default function GrowthAnalysisPage() {
  // 筛选状态
  const [filterYear, setFilterYear] = useState('2026');
  const [filterCrop, setFilterCrop] = useState('wheat');
  const [filterRegion, setFilterRegion] = useState('province');
  const [filterBaseline, setFilterBaseline] = useState('lastYear');

  // 城市过滤
  const userCity = useCityFilter();
  const { locationText } = useAuth();
  const filteredGrowthData = userCity ? cityGrowthData.filter(c => c.name === userCity) : cityGrowthData;

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityGrowthDetail | null>(null);

  // 全省长势指数
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
    toast.success('导出成功', { description: '长势分析数据已导出' });
  };

  // 对比分析
  const handleCompare = () => {
    toast.success('对比分析', { description: '正在生成长势对比分析报告...' });
  };

  // 查看详情
  const handleViewDetail = (item: typeof cityGrowthData[0]) => {
    const detail = getCityDetail(item);
    setSelectedCity(detail);
    setDetailOpen(true);
  };

  // 重置筛选
  const handleReset = () => {
    setFilterYear('2026');
    setFilterCrop('wheat');
    setFilterRegion('province');
    setFilterBaseline('lastYear');
    toast.success('筛选条件已重置');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="作物长势分析"
        description="通过遥感数据和地面采集数据，分析在地作物苗情长势，判断产量趋势"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button variant="outline" onClick={handleCompare}>
              <BarChart2 className="mr-2 h-4 w-4" />
              对比分析
            </Button>
          </div>
        }
      />

      {/* 筛选条件 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="分析年度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026年</SelectItem>
                <SelectItem value="2025">2025年</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCrop} onValueChange={setFilterCrop}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="作物类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wheat">小麦</SelectItem>
                <SelectItem value="rice">水稻</SelectItem>
                <SelectItem value="corn">玉米</SelectItem>
                <SelectItem value="soybean">大豆</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="监测区域" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="province">全省</SelectItem>
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
            <Select value={filterBaseline} onValueChange={setFilterBaseline}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="对比基准" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastYear">去年同期</SelectItem>
                <SelectItem value="avg">常年均值</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleReset}>
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 全省长势指数 */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="当前指数"
          value={provinceIndex.toFixed(2)}
          trend={{
            value: 0.02,
            label: '较上月+0.02',
            type: 'up',
          }}
        />
        <StatCard
          title="同比变化"
          value={`+${yoyChange}%`}
          trend={{
            value: yoyChange,
            label: '好于去年',
            type: 'up',
          }}
        />
        <StatCard
          title="常年均值"
          value={avgIndex.toFixed(2)}
          trend={{
            value: 0,
            label: '高于常年',
            type: 'up',
          }}
        />
        <StatCard
          title="长势评级"
          value="良好"
          className="border-success/50"
        />
      </div>

      {/* 图表和地图 */}
      <div className="grid gap-6 lg:grid-cols-1">
        {/* 全省长势分布地图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">全省长势分布地图（点击区域可下钻查看区县详情）</CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicDrillDownGrowthMap height="450px" />
          </CardContent>
        </Card>
      </div>

      {/* 长势对比分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">长势对比分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ChartLine
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">排名</TableHead>
                <TableHead>地区</TableHead>
                <TableHead>长势指数</TableHead>
                <TableHead>同比变化</TableHead>
                <TableHead>监测面积</TableHead>
                <TableHead>长势评级</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrowthData.sort((a, b) => b.index - a.index).map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
                        index < 3
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.index.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`flex items-center gap-1 ${
                        item.yoyChange >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {item.yoyChange >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {item.yoyChange >= 0 ? '+' : ''}
                      {item.yoyChange}%
                    </span>
                  </TableCell>
                  <TableCell>{(item.area / 10000).toFixed(1)}万亩</TableCell>
                  <TableCell>
                    <GrowthRatingBadge rating={
                      item.rating === 'excellent' ? '优秀' :
                      item.rating === 'good' ? '良好' :
                      item.rating === 'medium' ? '中等' :
                      item.rating === 'poor' ? '较差' : '差'
                    } />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetail(item)}>
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 产量形势研判 */}
      <Card className="border-info/50 bg-info/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-info">
            <BarChart2 className="h-5 w-5" />
            产量形势研判
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>综合研判：</strong>
            全省夏粮长势总体良好，预计产量较去年增长3-5%
          </p>
          <p className="text-warning">
            <strong>关注区域：</strong>
            阜阳、宿州部分地区因干旱导致长势偏差，需加强田管
          </p>
          <p className="text-success">
            <strong>建议措施：</strong>
            对长势偏差区域增施穗肥，提高结实率
          </p>
        </CardContent>
      </Card>

      {/* 城市长势详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {selectedCity?.name} - 长势详情
            </DialogTitle>
            <DialogDescription>
              查看该地区详细的作物长势分析数据
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
                  <div className={`text-2xl font-bold ${selectedCity.yoyChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {selectedCity.yoyChange >= 0 ? '+' : ''}{selectedCity.yoyChange}%
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
                  <div className="text-2xl font-bold">{(selectedCity.area / 10000).toFixed(1)}万亩</div>
                </div>
              </div>

              <Separator />

              {/* 月度趋势图 */}
              <div className="space-y-2">
                <div className="text-sm font-medium">月度长势趋势</div>
                <div className="h-[200px]">
                  <ChartLine
                    data={{
                      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                      datasets: [
                        {
                          label: selectedCity.name,
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

              {/* 区县排名 */}
              <div className="space-y-2">
                <div className="text-sm font-medium">区县长势排名</div>
                <div className="space-y-2">
                  {selectedCity.topCounties.map((county, i) => (
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
