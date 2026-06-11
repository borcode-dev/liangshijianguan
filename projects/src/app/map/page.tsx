'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProblemTypeBadge, RiskBadge, StatusBadge } from '@/components/shared';
import { spots, cityStats } from '@/lib/data/mock-data';
import type { ProblemType } from '@/types';
import {
  Maximize2,
  Download,
  Layers,
  Clock,
  Eye,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  ClockIcon,
  Map as MapIcon,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// 导入 SpotData 类型
import type { SpotData as MapSpotData } from '@/components/map/anhui-map';

// 动态导入地图组件，避免SSR问题
const AnhuiMap = dynamic(() => import('@/components/map/anhui-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted/50">
      <div className="text-center">
        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="text-muted-foreground">地图加载中...</p>
      </div>
    </div>
  )
});

type SpotData = MapSpotData;

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SpotData | null>(null);
  const [layers, setLayers] = useState({
    boundary: true,
    farmland: true,
    spots: true,
    growth: false,
    roads: false
  });

  // 将 spots 数据转换为 SpotData 格式
  const mapSpots: SpotData[] = useMemo(() => {
    return spots.map(spot => ({
      id: spot.id,
      type: spot.problemType,
      area: spot.area,
      risk: spot.riskLevel as 'high' | 'medium' | 'low',
      status: spot.status,
      location: spot.location,
      coordinates: [spot.coordinate.lat, spot.coordinate.lng] as [number, number],
      problemType: spot.problemType,
      riskLevel: spot.riskLevel as 'high' | 'medium' | 'low',
      deadline: spot.deadline
    }));
  }, []);

  const selectedCityStats = selectedCity ? cityStats.find(c => c.city === selectedCity) : null;

  // 处理地图上的城市点击
  const handleCityClick = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedSpot(null);
  };

  // 处理图斑点击
  const handleSpotClick = (spot: SpotData) => {
    setSelectedSpot(spot);
    setSelectedCity(null);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col space-y-4">
      <PageHeader
        title="粮食安全监测一张图"
        description="整合耕地资源底图、长势对比图、图斑分布图，实现粮食安全监管的全景可视化"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Clock className="mr-2 h-4 w-4" />
              时间轴
            </Button>
            <Button variant="outline" size="sm">
              <Layers className="mr-2 h-4 w-4" />
              图例
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="mr-2 h-4 w-4" />
              全屏
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        }
      />

      <div className="grid flex-1 gap-4 lg:grid-cols-4">
        {/* 地图区域 */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="h-full p-0">
              <div className="relative h-full">
                {/* 视图切换 */}
                <div className="absolute left-4 top-4 z-10">
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">全局态势</TabsTrigger>
                      <TabsTrigger value="monitor">智能监测</TabsTrigger>
                      <TabsTrigger value="closed-loop">闭环监管</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* 图层控制 */}
                <div className="absolute right-4 top-4 z-10">
                  <Card className="w-56">
                    <CardHeader className="py-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Layers className="h-4 w-4" />
                        图层控制
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="layer-boundary"
                          checked={layers.boundary}
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            setLayers(prev => ({ ...prev, boundary: !!checked }))
                          }
                        />
                        <Label htmlFor="layer-boundary" className="text-sm">
                          行政区划边界
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="layer-farmland"
                          checked={layers.farmland}
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            setLayers(prev => ({ ...prev, farmland: !!checked }))
                          }
                        />
                        <Label htmlFor="layer-farmland" className="text-sm">
                          永久基本农田
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="layer-spots"
                          checked={layers.spots}
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            setLayers(prev => ({ ...prev, spots: !!checked }))
                          }
                        />
                        <Label htmlFor="layer-spots" className="text-sm">
                          图斑位置
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="layer-growth"
                          checked={layers.growth}
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            setLayers(prev => ({ ...prev, growth: !!checked }))
                          }
                        />
                        <Label htmlFor="layer-growth" className="text-sm">
                          在地作物长势
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="layer-roads"
                          checked={layers.roads}
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            setLayers(prev => ({ ...prev, roads: !!checked }))
                          }
                        />
                        <Label htmlFor="layer-roads" className="text-sm">
                          道路水系
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 地图组件 */}
                <AnhuiMap 
                  onCityClick={handleCityClick}
                  onSpotClick={handleSpotClick}
                  spots={layers.spots ? mapSpots : []}
                />

                {/* 图例 */}
                <div className="absolute bottom-4 left-4 z-10">
                  <Card className="p-3">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-red-500"></span>
                        <span>待核查</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                        <span>整改中</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        <span>已结案</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-orange-500"></span>
                        <span>长势偏差</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* 数据更新时间 */}
                <div className="absolute bottom-4 right-4 z-10">
                  <Card className="px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      数据更新时间：2026-06-09 19:00
                    </p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息面板 */}
        <div className="space-y-4">
          {/* 城市统计 */}
          {selectedCityStats && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{selectedCityStats.city}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCity(null)}>
                    关闭
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span className="text-muted-foreground">待核查：</span>
                    <span className="font-medium">{selectedCityStats.pending}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    <span className="text-muted-foreground">整改中：</span>
                    <span className="font-medium">{selectedCityStats.rectifying}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-muted-foreground">已结案：</span>
                    <span className="font-medium">{selectedCityStats.closed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span className="text-muted-foreground">长势偏差：</span>
                    <span className="font-medium">{selectedCityStats.growthDeviation}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    钻取县区
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    钻取图斑
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 图斑详情 */}
          {selectedSpot && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>图斑详情</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSpot(null)}>
                    关闭
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">图斑编号</span>
                    <span className="font-medium">{selectedSpot.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">问题类型</span>
                    <ProblemTypeBadge type={(selectedSpot.problemType || selectedSpot.type) as ProblemType} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">面积</span>
                    <span className="font-medium">{selectedSpot.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">风险等级</span>
                    <RiskBadge level={(selectedSpot.risk || selectedSpot.riskLevel || 'medium') as 'high' | 'medium' | 'low'} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">行政区划</span>
                    <span className="font-medium">{selectedSpot.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">处置状态</span>
                    <StatusBadge status={selectedSpot.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">处置时限</span>
                    <span className="font-medium">{selectedSpot.deadline}</span>
                  </div>
                </div>

                {/* 处置进度 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">处置进度</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      生成
                    </span>
                    <span className="h-px flex-1 bg-border"></span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      下发
                    </span>
                    <span className="h-px flex-1 bg-border"></span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      核查
                    </span>
                    <span className="h-px flex-1 bg-border"></span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted"></span>
                      整改
                    </span>
                    <span className="h-px flex-1 bg-border"></span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted"></span>
                      结案
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-1 h-3 w-3" />
                    查看详情
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Navigation className="mr-1 h-3 w-3" />
                    导航
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 图斑状态统计 */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">全省图斑状态统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5">
                  <span className="text-muted-foreground">待下发</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5">
                  <span className="text-muted-foreground">待核查</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5">
                  <span className="text-muted-foreground">核查中</span>
                  <span className="font-medium">56</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5">
                  <span className="text-muted-foreground">待审核</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5">
                  <span className="text-muted-foreground">整改中</span>
                  <span className="font-medium">67</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5">
                  <span className="text-muted-foreground">待验收</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="col-span-2 flex items-center justify-between rounded-md bg-green-500/10 px-2 py-1.5">
                  <span className="text-green-700">已结案</span>
                  <span className="font-medium text-green-700">456</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                进入卫片监测
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                进入变化图斑
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                进入长势分析
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
