'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader, NewBatchDialog, MonitorBatchDetailDialog } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { monitorBatches as mockBatches } from '@/lib/data/mock-data';
import { getStorageData, setStorageData, generateId, generateNo } from '@/lib/storage';
import { useCityFilter, filterByRegion } from '@/lib/data/filter';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Plus, Download, Search, Eye } from 'lucide-react';
import type { MonitorBatch } from '@/types';

const STORAGE_KEY = 'satellite-monitor-batches';
const PAGE_SIZE = 10;

export default function SatelliteMonitorPage() {
  const userCity = useCityFilter();
  // 从 localStorage 初始化数据，mock 数据作为回退
  const [batches, setBatches] = useState<MonitorBatch[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = getStorageData<MonitorBatch[]>(STORAGE_KEY, mockBatches);
    setBatches(userCity ? stored.filter(b => b.region === userCity || b.region === '全省' || b.region.includes(userCity)) : stored);
    setInitialized(true);
  }, []);

  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');

  // 弹窗状态
  const [showNewBatchDialog, setShowNewBatchDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<MonitorBatch | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);

  // 筛选逻辑
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      // 搜索过滤：批次编号或区域
      const matchSearch =
        searchTerm === '' ||
        batch.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.region.includes(searchTerm);

      // 年度过滤
      const matchYear =
        filterYear === 'all' ||
        batch.monitorDate.startsWith(filterYear);

      // 影像来源过滤
      const matchSource =
        filterSource === 'all' ||
        (filterSource === 'satellite' && batch.imageSource === '卫星遥感') ||
        (filterSource === 'drone' && batch.imageSource === '无人机');

      // 区域过滤
      const matchRegion =
        filterRegion === 'all' ||
        (filterRegion === 'province' && batch.region === '全省') ||
        batch.region.includes(filterRegion);

      return matchSearch && matchYear && matchSource && matchRegion;
    });
  }, [batches, searchTerm, filterYear, filterSource, filterRegion]);

  // 分页计算
  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE));
  const paginatedBatches = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBatches.slice(start, start + PAGE_SIZE);
  }, [filteredBatches, currentPage]);

  // 筛选变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterYear, filterSource, filterRegion]);

  // 新增监测批次
  const handleCreateBatch = (data: { name: string; period: string; satellite: string; description: string }) => {
    const satelliteMap: Record<string, string> = {
      sentinel2: '卫星遥感',
      gaofen1: '卫星遥感',
      gaofen6: '卫星遥感',
      landsat8: '卫星遥感',
    };

    const newBatch: MonitorBatch = {
      id: generateId(),
      batchNo: generateNo('JM'),
      monitorDate: data.period ? `${data.period}-01` : new Date().toISOString().split('T')[0],
      imageSource: (satelliteMap[data.satellite] || '卫星遥感') as MonitorBatch['imageSource'],
      region: '全省',
      spotCount: Math.floor(Math.random() * 200) + 50,
      suspectedCount: Math.floor(Math.random() * 30) + 5,
      resolution: data.satellite === 'sentinel2' ? '10米' : data.satellite === 'gaofen1' ? '2米' : data.satellite === 'gaofen6' ? '2米' : '30米',
      coverage: '14万平方公里',
    };

    const updated = [newBatch, ...batches];
    setBatches(updated);
    setStorageData(STORAGE_KEY, updated);
    toast.success('监测批次创建成功', { description: `批次编号：${newBatch.batchNo}` });
  };

  // 导出
  const handleExport = () => {
    toast.success('导出成功', { description: '监测批次数据已导出' });
  };

  // 查看详情
  const handleViewBatch = (batch: MonitorBatch) => {
    setSelectedBatch(batch);
    setShowDetailDialog(true);
  };

  if (!initialized) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="卫片监测"
        description="接入遥感卫片和无人机航拍数据，结合AI识别技术，自动识别耕地种植情况"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowNewBatchDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新增监测
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              导出
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
                <SelectValue placeholder="监测年度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部年度</SelectItem>
                <SelectItem value="2026">2026年</SelectItem>
                <SelectItem value="2025">2025年</SelectItem>
                <SelectItem value="2024">2024年</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="影像来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="satellite">卫星遥感</SelectItem>
                <SelectItem value="drone">无人机</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="监测区域" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部区域</SelectItem>
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索批次编号或区域..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 监测批次列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">监测批次列表</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="mb-2 h-8 w-8" />
              <p>暂无匹配的监测批次</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>批次编号</TableHead>
                  <TableHead>监测时间</TableHead>
                  <TableHead>影像来源</TableHead>
                  <TableHead>监测范围</TableHead>
                  <TableHead>图斑数量</TableHead>
                  <TableHead>疑似问题</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.batchNo}</TableCell>
                    <TableCell>{batch.monitorDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {batch.imageSource}
                      </Badge>
                    </TableCell>
                    <TableCell>{batch.region}</TableCell>
                    <TableCell>{batch.spotCount}个</TableCell>
                    <TableCell>
                      <span className="text-warning">{batch.suspectedCount}个</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBatch(batch)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 分页 */}
          {filteredBatches.length > 0 && (
            <div className="flex items-center justify-between border-t p-4">
              <span className="text-sm text-muted-foreground">
                共 {filteredBatches.length} 条记录，第 {currentPage}/{totalPages} 页
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新增监测批次弹窗 */}
      <NewBatchDialog
        open={showNewBatchDialog}
        onOpenChange={setShowNewBatchDialog}
        onCreate={handleCreateBatch}
      />

      {/* 监测批次详情弹窗 */}
      <MonitorBatchDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        batch={selectedBatch}
      />
    </div>
  );
}
