'use client';

import { useState, useMemo } from 'react';
import { PageHeader, StatCard, GrowthRatingBadge } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { ChartLine, ChartBar } from '@/components/shared/charts';
import { cityGrowthData } from '@/lib/data/growth-data';
import { growthData } from '@/lib/data/mock-data';
import { varietyComparisons, regionComparisons, growthWarnings, warningStats } from '@/lib/data/growth-comparison-data';
import { useCityFilter } from '@/lib/data/filter';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Download, TrendingUp, TrendingDown, BarChart2, MapPin, AlertTriangle, ChevronDown, ChevronRight, Shield, Bell, Settings, FileText, Eye, Send } from 'lucide-react';
import type { GrowthWarning } from '@/types';

const DynamicDrillDownGrowthMap = dynamic(
  () => import('@/components/map/drill-down-growth-map').then((mod) => mod.DrillDownGrowthMap),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">地图加载中...</div> }
);

// 风险等级徽章
function RiskLevelBadge({ level }: { level: '正常' | '偏低' | '偏差' | '严重' }) {
  const config = {
    '正常': 'bg-green-100 text-green-800 border-green-200',
    '偏低': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    '偏差': 'bg-orange-100 text-orange-800 border-orange-200',
    '严重': 'bg-red-100 text-red-800 border-red-200',
  };
  return <Badge variant="outline" className={config[level]}>{level}</Badge>;
}

// 预警等级徽章
function WarningLevelBadge({ level }: { level: 'RED' | 'ORANGE' | 'YELLOW' }) {
  const config = {
    'RED': { className: 'bg-red-100 text-red-800 border-red-200', label: '红色预警' },
    'ORANGE': { className: 'bg-orange-100 text-orange-800 border-orange-200', label: '橙色预警' },
    'YELLOW': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '黄色预警' },
  };
  const c = config[level];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

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

  const base = item.index;
  const monthlyData = [
    base - 0.07, base - 0.04, base, base + 0.03, base + 0.01, base,
  ];

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
  const [filterVariety, setFilterVariety] = useState('all');

  // 城市过滤
  const userCity = useCityFilter();
  const { locationText } = useAuth();
  const filteredGrowthData = userCity ? cityGrowthData.filter(c => c.name === userCity) : cityGrowthData;

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityGrowthDetail | null>(null);

  // 品种对比 - 作物类型筛选
  const [selectedCropTypes, setSelectedCropTypes] = useState<string[]>(['小麦', '玉米', '大豆', '水稻']);

  const toggleCropType = (cropType: string) => {
    setSelectedCropTypes(prev =>
      prev.includes(cropType)
        ? prev.filter(t => t !== cropType)
        : [...prev, cropType]
    );
  };

  // 区域对比 - 展开状态
  const [expandedCities, setExpandedCities] = useState<Set<string>>(() => {
    const risky = regionComparisons
      .filter(r => r.riskLevel !== '正常')
      .map(r => r.regionName);
    return new Set(risky);
  });

  const toggleCityExpand = (cityName: string) => {
    setExpandedCities(prev => {
      const next = new Set(prev);
      if (next.has(cityName)) {
        next.delete(cityName);
      } else {
        next.add(cityName);
      }
      return next;
    });
  };

  // 预警详情弹窗
  const [warningDetailOpen, setWarningDetailOpen] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState<GrowthWarning | null>(null);
  const [warningNotes, setWarningNotes] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

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

  // 品种对比数据（按城市过滤）
  const filteredVarieties = useMemo(() => {
    let data = varietyComparisons;
    if (userCity) {
      data = data.filter(v => v.mainRegions.includes(userCity));
    }
    data = data.filter(v => selectedCropTypes.includes(v.cropType));
    return data;
  }, [userCity, selectedCropTypes]);

  // 品种对比柱状图数据
  const varietyBarData = useMemo(() => ({
    labels: filteredVarieties.map(v => v.varietyName),
    datasets: [
      {
        label: '今年长势',
        data: filteredVarieties.map(v => v.currentIndex),
        backgroundColor: 'oklch(0.45 0.15 250 / 80%)',
        borderColor: 'oklch(0.45 0.15 250)',
        borderWidth: 1,
      },
      {
        label: '去年长势',
        data: filteredVarieties.map(v => v.baselineIndex),
        backgroundColor: 'oklch(0.7 0.18 135 / 80%)',
        borderColor: 'oklch(0.7 0.18 135)',
        borderWidth: 1,
      },
    ],
  }), [filteredVarieties]);

  // 区域对比数据（按城市过滤）
  const filteredRegions = useMemo(() => {
    if (userCity) {
      return regionComparisons.filter(r => r.regionName === userCity);
    }
    return regionComparisons;
  }, [userCity]);

  // 预警数据（按城市过滤）
  const filteredWarnings = useMemo(() => {
    if (userCity) {
      return growthWarnings.filter(w => w.city === userCity);
    }
    return growthWarnings;
  }, [userCity]);

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
    setFilterVariety('all');
    toast.success('筛选条件已重置');
  };

  // 查看预警详情
  const handleViewWarningDetail = (warning: GrowthWarning) => {
    setSelectedWarning(warning);
    setWarningNotes('');
    setSelectedSuggestions(new Set());
    setWarningDetailOpen(true);
  };

  // 预警操作
  const handleBatchPush = () => {
    toast.success('批量推送', { description: '已将待处理预警推送至相关责任人' });
  };

  const handleExportWarningReport = () => {
    toast.success('导出成功', { description: '预警报告已导出' });
  };

  const handleMarkProcessed = () => {
    toast.success('标记成功', { description: '已将选中预警标记为已处理' });
  };

  const handleAcknowledge = () => {
    toast.success('已知晓', { description: '预警已标记为已知晓' });
    setWarningDetailOpen(false);
  };

  const handlePushDisposition = () => {
    toast.success('推送成功', { description: '处置建议已推送至相关责任人' });
    setWarningDetailOpen(false);
  };

  const handleGenerateReport = () => {
    toast.success('报告已生成', { description: '预警报告已生成并下载' });
  };

  const toggleSuggestion = (idx: number) => {
    setSelectedSuggestions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
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
            <Select value={filterBaseline} onValueChange={setFilterBaseline}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="对比基准" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastYear">去年同期</SelectItem>
                <SelectItem value="avg">常年均值</SelectItem>
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
            <Select value={filterVariety} onValueChange={setFilterVariety}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="品种筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部品种</SelectItem>
                <SelectItem value="wheat">小麦品种</SelectItem>
                <SelectItem value="corn">玉米品种</SelectItem>
                <SelectItem value="soybean">大豆品种</SelectItem>
                <SelectItem value="rice">水稻品种</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleReset}>
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 选项卡 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">长势总览</TabsTrigger>
          <TabsTrigger value="variety">品种对比</TabsTrigger>
          <TabsTrigger value="region">区域对比</TabsTrigger>
          <TabsTrigger value="warning">风险预警</TabsTrigger>
        </TabsList>

        {/* ========== Tab 1: 长势总览 ========== */}
        <TabsContent value="overview" className="space-y-6">
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

          {/* 全省长势分布地图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">全省长势分布地图（点击区域可下钻查看区县详情）</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicDrillDownGrowthMap height="450px" />
            </CardContent>
          </Card>

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
        </TabsContent>

        {/* ========== Tab 2: 品种对比 ========== */}
        <TabsContent value="variety" className="space-y-6">
          {/* 作物类型筛选 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">作物类型：</span>
                <div className="flex gap-2">
                  {['小麦', '玉米', '大豆', '水稻'].map(cropType => (
                    <Button
                      key={cropType}
                      variant={selectedCropTypes.includes(cropType) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCropType(cropType)}
                    >
                      {cropType}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 品种对比表格 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">品种长势对比</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>品种名称</TableHead>
                    <TableHead>作物类型</TableHead>
                    <TableHead>今年长势</TableHead>
                    <TableHead>去年长势</TableHead>
                    <TableHead>变化幅度</TableHead>
                    <TableHead>风险等级</TableHead>
                    <TableHead>涉及面积</TableHead>
                    <TableHead>主要分布</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVarieties.map(v => (
                    <TableRow key={v.varietyName}>
                      <TableCell className="font-medium">{v.varietyName}</TableCell>
                      <TableCell>{v.cropType}</TableCell>
                      <TableCell>{v.currentIndex.toFixed(2)}</TableCell>
                      <TableCell>{v.baselineIndex.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 ${v.changeRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {v.changeRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {v.changeRate >= 0 ? '+' : ''}{v.changeRate.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell><RiskLevelBadge level={v.riskLevel} /></TableCell>
                      <TableCell>{(v.affectedArea / 10000).toFixed(1)}万亩</TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm text-muted-foreground">{v.mainRegions.join('、')}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">详情</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 品种对比柱状图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">品种长势对比图</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ChartBar
                  data={varietyBarData}
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
            </CardContent>
          </Card>

          {/* 下降品种提示 */}
          {filteredVarieties.some(v => v.changeRate < -5) && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-warning">品种长势下降预警</p>
                    <p className="text-muted-foreground">
                      以下品种长势较去年下降超过5%：
                      {filteredVarieties
                        .filter(v => v.changeRate < -5)
                        .map(v => `${v.varietyName}(${v.cropType}，下降${Math.abs(v.changeRate).toFixed(1)}%)`)
                        .join('、')}
                      ，建议重点关注并加强田间管理。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ========== Tab 3: 区域对比 ========== */}
        <TabsContent value="region" className="space-y-6">
          {/* 区域对比树形表格 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">区域长势对比（点击"钻取"展开区县数据）</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>地区</TableHead>
                    <TableHead>今年长势</TableHead>
                    <TableHead>去年长势</TableHead>
                    <TableHead>变化幅度</TableHead>
                    <TableHead>风险等级</TableHead>
                    <TableHead>监测面积</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegions.map(region => (
                    <>
                      <TableRow key={region.regionName} className={region.riskLevel !== '正常' ? 'bg-warning/5' : ''}>
                        <TableCell>
                          {region.children && region.children.length > 0 && (
                            <button
                              onClick={() => toggleCityExpand(region.regionName)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                            >
                              {expandedCities.has(region.regionName) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {region.regionName}
                          </div>
                        </TableCell>
                        <TableCell>{region.currentIndex.toFixed(2)}</TableCell>
                        <TableCell>{region.baselineIndex.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`flex items-center gap-1 ${region.changeRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {region.changeRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {region.changeRate >= 0 ? '+' : ''}{region.changeRate.toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell><RiskLevelBadge level={region.riskLevel} /></TableCell>
                        <TableCell>{(region.monitoringArea / 10000).toFixed(1)}万亩</TableCell>
                        <TableCell className="text-right">
                          {region.children && region.children.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCityExpand(region.regionName)}
                            >
                              钻取
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedCities.has(region.regionName) && region.children?.map(county => (
                        <TableRow key={county.regionName} className="bg-muted/30">
                          <TableCell></TableCell>
                          <TableCell className="pl-8">
                            <span className="text-muted-foreground">└ {county.regionName}</span>
                          </TableCell>
                          <TableCell>{county.currentIndex.toFixed(2)}</TableCell>
                          <TableCell>{county.baselineIndex.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`flex items-center gap-1 ${county.changeRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {county.changeRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {county.changeRate >= 0 ? '+' : ''}{county.changeRate.toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell><RiskLevelBadge level={county.riskLevel} /></TableCell>
                          <TableCell>{(county.monitoringArea / 10000).toFixed(1)}万亩</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 热力图描述 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5" />
                区域长势热力分布
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-5 gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-red-500"></div>
                  <span>严重 (&lt;0.65)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-orange-500"></div>
                  <span>偏差 (0.65-0.72)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-yellow-500"></div>
                  <span>偏低 (0.72-0.76)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-500"></div>
                  <span>正常 (0.76-0.85)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-emerald-600"></div>
                  <span>优秀 (&gt;0.85)</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                热力图基于各区县当前长势指数自动着色，颜色越深表示长势越好。阜阳市阜南县、宿州市萧县等区域长势指数偏低，呈现橙色至红色，需重点关注。
              </p>
            </CardContent>
          </Card>

          {/* 综合研判 */}
          <Card className="border-info/50 bg-info/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-info">
                <BarChart2 className="h-5 w-5" />
                综合研判
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>总体态势：</strong>
                全省16个地市中，13个地市长势正常或偏好，3个地市（阜阳市、宿州市、黄山市）长势偏低，需加强关注。
              </p>
              <p className="text-warning">
                <strong>重点关注：</strong>
                阜阳市阜南县、宿州市萧县、黄山市祁门县等区县长势指数低于0.70，风险等级为偏低或偏差，建议立即采取田管措施。
              </p>
              <p className="text-success">
                <strong>良好区域：</strong>
                合肥市、芜湖市、滁州市、马鞍山市等地区长势指数均超过0.80，表现良好，预计产量稳中有增。
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== Tab 4: 风险预警 ========== */}
        <TabsContent value="warning" className="space-y-6">
          {/* 预警规则配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-5 w-5" />
                预警规则配置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">自动检测周期</div>
                  <div className="mt-1 font-medium">每7天自动检测一次</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">预警阈值</div>
                  <div className="mt-1 font-medium">同比下降≥5% 黄色 / ≥8% 橙色 / ≥12% 红色</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">推送设置</div>
                  <div className="mt-1 font-medium">自动推送至市级农业农村局</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 预警统计 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">红色预警</div>
                    <div className="text-2xl font-bold text-red-600">{warningStats.red}</div>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">橙色预警</div>
                    <div className="text-2xl font-bold text-orange-600">{warningStats.orange}</div>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">黄色预警</div>
                    <div className="text-2xl font-bold text-yellow-600">{warningStats.yellow}</div>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">本周新增</div>
                    <div className="text-2xl font-bold text-blue-600">{warningStats.newThisWeek}</div>
                  </div>
                  <Bell className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 预警操作按钮 */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBatchPush}>
              <Send className="mr-2 h-4 w-4" />
              批量推送
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportWarningReport}>
              <FileText className="mr-2 h-4 w-4" />
              导出预警报告
            </Button>
            <Button variant="outline" size="sm" onClick={handleMarkProcessed}>
              <Shield className="mr-2 h-4 w-4" />
              标记已处理
            </Button>
          </div>

          {/* 预警列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">预警列表</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>预警ID</TableHead>
                    <TableHead>区域</TableHead>
                    <TableHead>作物品种</TableHead>
                    <TableHead>下降幅度</TableHead>
                    <TableHead>涉及面积</TableHead>
                    <TableHead>影响农户</TableHead>
                    <TableHead>预警等级</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarnings.map(w => (
                    <TableRow key={w.warningId} className={w.warningLevel === 'RED' ? 'bg-red-50/50' : ''}>
                      <TableCell className="font-mono text-sm">{w.warningId}</TableCell>
                      <TableCell className="font-medium">{w.regionName}</TableCell>
                      <TableCell>{w.cropType}·{w.cropVariety}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-destructive">
                          <TrendingDown className="h-4 w-4" />
                          {w.changeRate.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>{(w.affectedArea / 10000).toFixed(1)}万亩</TableCell>
                      <TableCell>{w.affectedFarmers}户</TableCell>
                      <TableCell><WarningLevelBadge level={w.warningLevel} /></TableCell>
                      <TableCell>
                        <Badge variant={
                          w.status === '待处理' ? 'destructive' :
                          w.status === '已推送' ? 'default' :
                          w.status === '已处理' ? 'secondary' : 'outline'
                        }>
                          {w.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewWarningDetail(w)}>
                          <Eye className="mr-1 h-4 w-4" />
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      {/* 预警详情弹窗 */}
      <Dialog open={warningDetailOpen} onOpenChange={setWarningDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              预警详情 - {selectedWarning?.warningId}
            </DialogTitle>
            <DialogDescription>
              查看预警详细信息及处置建议
            </DialogDescription>
          </DialogHeader>

          {selectedWarning && (
            <div className="space-y-5">
              {/* 预警基本信息 */}
              <div className="space-y-3">
                <div className="text-sm font-medium">预警基本信息</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">预警编号</div>
                    <div className="font-mono text-sm font-medium">{selectedWarning.warningId}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">预警等级</div>
                    <div className="mt-1"><WarningLevelBadge level={selectedWarning.warningLevel} /></div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">预警区域</div>
                    <div className="text-sm font-medium">{selectedWarning.regionName}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">作物品种</div>
                    <div className="text-sm font-medium">{selectedWarning.cropType}·{selectedWarning.cropVariety}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">涉及面积</div>
                    <div className="text-sm font-medium">{(selectedWarning.affectedArea / 10000).toFixed(1)}万亩</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">影响农户</div>
                    <div className="text-sm font-medium">{selectedWarning.affectedFarmers}户</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">生成时间</div>
                    <div className="text-sm font-medium">{selectedWarning.generateTime}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">状态</div>
                    <div className="mt-1">
                      <Badge variant={
                        selectedWarning.status === '待处理' ? 'destructive' :
                        selectedWarning.status === '已推送' ? 'default' :
                        selectedWarning.status === '已处理' ? 'secondary' : 'outline'
                      }>
                        {selectedWarning.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 长势对比数据 */}
              <div className="space-y-3">
                <div className="text-sm font-medium">长势对比数据</div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">当前指数</div>
                    <div className="text-lg font-bold">{selectedWarning.currentIndex.toFixed(2)}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">去年指数</div>
                    <div className="text-lg font-bold">{selectedWarning.lastYearIndex.toFixed(2)}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">变化率</div>
                    <div className="text-lg font-bold text-destructive">{selectedWarning.changeRate.toFixed(2)}%</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">常年均值</div>
                    <div className="text-lg font-bold">{(selectedWarning.lastYearIndex * 1.02).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 趋势图 */}
              <div className="space-y-3">
                <div className="text-sm font-medium">长势趋势对比</div>
                <div className="h-[220px]">
                  <ChartLine
                    data={{
                      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                      datasets: [
                        {
                          label: '今年',
                          data: [
                            selectedWarning.currentIndex - 0.08,
                            selectedWarning.currentIndex - 0.05,
                            selectedWarning.currentIndex - 0.02,
                            selectedWarning.currentIndex + 0.01,
                            selectedWarning.currentIndex - 0.01,
                            selectedWarning.currentIndex,
                          ],
                          borderColor: 'oklch(0.45 0.15 250)',
                          backgroundColor: 'oklch(0.45 0.15 250 / 10%)',
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: '去年',
                          data: [
                            selectedWarning.lastYearIndex - 0.06,
                            selectedWarning.lastYearIndex - 0.04,
                            selectedWarning.lastYearIndex - 0.01,
                            selectedWarning.lastYearIndex + 0.02,
                            selectedWarning.lastYearIndex + 0.01,
                            selectedWarning.lastYearIndex,
                          ],
                          borderColor: 'oklch(0.7 0.18 135)',
                          backgroundColor: 'transparent',
                          borderDash: [5, 5],
                          tension: 0.4,
                        },
                        {
                          label: '常年均值',
                          data: Array(6).fill(selectedWarning.lastYearIndex * 1.02),
                          borderColor: 'oklch(0.5 0.01 260)',
                          backgroundColor: 'transparent',
                          borderDash: [2, 2],
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
                          min: 0.4,
                          max: 1.0,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <Separator />

              {/* 原因分析 */}
              <div className="space-y-3">
                <div className="text-sm font-medium">原因分析</div>
                <div className="space-y-2">
                  {selectedWarning.causeAnalysis?.map((cause, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-lg border p-3">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                        selectedWarning.warningLevel === 'RED' ? 'text-red-500' :
                        selectedWarning.warningLevel === 'ORANGE' ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                      <span className="text-sm">{cause}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 处置建议 */}
              <div className="space-y-3">
                <div className="text-sm font-medium">处置建议</div>
                <div className="space-y-2">
                  {selectedWarning.suggestions?.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-lg border p-3">
                      <Checkbox
                        checked={selectedSuggestions.has(idx)}
                        onCheckedChange={() => toggleSuggestion(idx)}
                      />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 处置操作 */}
              <div className="space-y-3">
                <div className="text-sm font-medium">处置操作</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">推送目标</Label>
                    <div className="rounded-lg border p-2 text-sm">{selectedWarning.regionName}农业农村局</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">推送方式</Label>
                    <div className="rounded-lg border p-2 text-sm">系统通知 + 短信推送</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">处置备注</Label>
                  <Textarea
                    placeholder="请输入处置备注..."
                    value={warningNotes}
                    onChange={(e) => setWarningNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleAcknowledge}>
                  标记已知晓
                </Button>
                <Button variant="default" onClick={handlePushDisposition}>
                  <Send className="mr-2 h-4 w-4" />
                  推送处置
                </Button>
                <Button variant="outline" onClick={handleGenerateReport}>
                  <FileText className="mr-2 h-4 w-4" />
                  生成预警报告
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
