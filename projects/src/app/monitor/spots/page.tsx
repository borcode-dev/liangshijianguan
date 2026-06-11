'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader, StatusBadge, RiskBadge, ProblemTypeBadge, SpotDetailDialog, TaskAssignDialog } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { spots as mockSpots } from '@/lib/data/mock-data';
import { getStorageData, setStorageData } from '@/lib/storage';
import { toast } from 'sonner';
import { Download, Search, Eye, Send } from 'lucide-react';
import type { SpotStatus, Spot } from '@/types';

const STORAGE_KEY = 'monitor-spots';
const PAGE_SIZE = 10;

export default function SpotsPage() {
  // 从 localStorage 初始化数据
  const [spots, setSpots] = useState<Spot[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = getStorageData<Spot[]>(STORAGE_KEY, mockSpots);
    setSpots(stored);
    setInitialized(true);
  }, []);

  // 筛选状态
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProblemType, setFilterProblemType] = useState('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');

  // 弹窗状态
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // 多选状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);

  // 计算各状态数量（基于实际数据）
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: spots.length };
    spots.forEach((spot) => {
      counts[spot.status] = (counts[spot.status] || 0) + 1;
    });
    return counts;
  }, [spots]);

  // 状态标签页配置
  const statusTabs = useMemo(() => {
    const tabs = [
      { value: 'all', label: '全量' },
      { value: '待下发', label: '待下发' },
      { value: '待核查', label: '待核查' },
      { value: '核查中', label: '核查中' },
      { value: '待上报', label: '待上报' },
      { value: '待审核', label: '待审核' },
      { value: '整改中', label: '整改中' },
      { value: '已结案', label: '已结案' },
      { value: '需复查', label: '需复查' },
    ];
    return tabs.map((tab) => ({
      ...tab,
      count: statusCounts[tab.value] || 0,
    }));
  }, [statusCounts]);

  // 筛选逻辑
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      // 标签页过滤
      const matchTab = activeTab === 'all' || spot.status === activeTab;

      // 搜索过滤
      const matchSearch =
        searchTerm === '' ||
        spot.spotNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.location.includes(searchTerm);

      // 问题类型过滤
      const matchProblemType =
        filterProblemType === 'all' || spot.problemType === filterProblemType;

      // 风险等级过滤
      const matchRiskLevel =
        filterRiskLevel === 'all' || spot.riskLevel === filterRiskLevel;

      // 状态过滤
      const matchStatus =
        filterStatus === 'all' || spot.status === filterStatus;

      // 区域过滤
      const matchRegion =
        filterRegion === 'all' ||
        (filterRegion === 'bengbu' && spot.city === '蚌埠市') ||
        (filterRegion === 'fuyang' && spot.city === '阜阳市') ||
        (filterRegion === 'suzhou' && spot.city === '宿州市') ||
        (filterRegion === 'chuzhou' && spot.city === '滁州市') ||
        (filterRegion === 'hefei' && spot.city === '合肥市');

      return matchTab && matchSearch && matchProblemType && matchRiskLevel && matchStatus && matchRegion;
    });
  }, [spots, activeTab, searchTerm, filterProblemType, filterRiskLevel, filterStatus, filterRegion]);

  // 分页计算
  const totalPages = Math.max(1, Math.ceil(filteredSpots.length / PAGE_SIZE));
  const paginatedSpots = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSpots.slice(start, start + PAGE_SIZE);
  }, [filteredSpots, currentPage]);

  // 筛选变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, filterProblemType, filterRiskLevel, filterStatus, filterRegion]);

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedSpots.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 单选/取消单选
  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  // 查看详情
  const handleViewDetail = (spot: Spot) => {
    setSelectedSpot(spot);
    setDetailOpen(true);
  };

  // 批量下发
  const handleBatchAssign = () => {
    const selectedSpots = spots.filter((s) => selectedIds.has(s.id));
    if (selectedSpots.length === 0) {
      toast.error('请先选择需要下发的图斑');
      return;
    }
    setAssignDialogOpen(true);
  };

  // 确认下发
  const handleAssignConfirm = (data: { unit: string; deadline: number; remark: string }) => {
    const updated = spots.map((spot) => {
      if (selectedIds.has(spot.id) && spot.status === '待下发') {
        return {
          ...spot,
          status: '待核查' as SpotStatus,
          inspector: data.unit,
          deadline: new Date(Date.now() + data.deadline * 86400000).toISOString().split('T')[0],
        };
      }
      return spot;
    });
    setSpots(updated);
    setStorageData(STORAGE_KEY, updated);
    toast.success('批量下发成功', { description: `已下发 ${selectedIds.size} 个图斑至${data.unit}` });
    setSelectedIds(new Set());
  };

  // 导出
  const handleExport = () => {
    toast.success('导出成功', { description: '图斑数据已导出' });
  };

  const getRiskIcon = (level: string) => {
    if (level === 'high') return '🔴';
    if (level === 'medium') return '🟡';
    return '🟢';
  };

  if (!initialized) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="变化图斑管理"
        description="管理所有监测发现的疑似问题图斑，记录图斑基本信息、风险等级、处置状态"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBatchAssign}>
              <Send className="mr-2 h-4 w-4" />
              批量下发
              {selectedIds.size > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {selectedIds.size}
                </Badge>
              )}
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
            <Select value={filterProblemType} onValueChange={setFilterProblemType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="问题类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="撂荒">撂荒</SelectItem>
                <SelectItem value="疑似割青">疑似割青</SelectItem>
                <SelectItem value="非粮化">非粮化</SelectItem>
                <SelectItem value="种植计划未落实">种植计划未落实</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRiskLevel} onValueChange={setFilterRiskLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="风险等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部等级</SelectItem>
                <SelectItem value="high">高风险</SelectItem>
                <SelectItem value="medium">中风险</SelectItem>
                <SelectItem value="low">低风险</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="处置状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="待核查">待核查</SelectItem>
                <SelectItem value="整改中">整改中</SelectItem>
                <SelectItem value="已结案">已结案</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="所属地区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部地区</SelectItem>
                <SelectItem value="bengbu">蚌埠市</SelectItem>
                <SelectItem value="fuyang">阜阳市</SelectItem>
                <SelectItem value="suzhou">宿州市</SelectItem>
                <SelectItem value="chuzhou">滁州市</SelectItem>
                <SelectItem value="hefei">合肥市</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索图斑编号或位置..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 状态标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
              <Badge variant="secondary" className="ml-1.5">
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {paginatedSpots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="mb-2 h-8 w-8" />
                  <p>暂无匹配的图斑数据</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={
                            paginatedSpots.length > 0 &&
                            paginatedSpots.every((s) => selectedIds.has(s.id))
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>图斑编号</TableHead>
                      <TableHead>问题类型</TableHead>
                      <TableHead>面积</TableHead>
                      <TableHead>风险等级</TableHead>
                      <TableHead>行政区划</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>核查人</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSpots.map((spot) => (
                      <TableRow key={spot.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(spot.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOne(spot.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">{spot.spotNo}</TableCell>
                        <TableCell>
                          <ProblemTypeBadge type={spot.problemType} />
                        </TableCell>
                        <TableCell>{spot.area}亩</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{getRiskIcon(spot.riskLevel)}</span>
                            <RiskBadge level={spot.riskLevel} />
                          </div>
                        </TableCell>
                        <TableCell>{spot.location}</TableCell>
                        <TableCell>
                          <StatusBadge status={spot.status as SpotStatus} />
                        </TableCell>
                        <TableCell>{spot.inspector || '--'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(spot)}>
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
              {filteredSpots.length > 0 && (
                <div className="flex items-center justify-between border-t p-4">
                  <span className="text-sm text-muted-foreground">
                    共 {filteredSpots.length} 个图斑，第 {currentPage}/{totalPages} 页
                    {selectedIds.size > 0 && (
                      <span className="ml-2 text-primary">
                        已选 {selectedIds.size} 个
                      </span>
                    )}
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
        </TabsContent>
      </Tabs>

      {/* 图斑详情弹窗 */}
      <SpotDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        spot={selectedSpot}
      />

      {/* 批量下发弹窗 */}
      <TaskAssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        spots={spots.filter((s) => selectedIds.has(s.id))}
        onConfirm={handleAssignConfirm}
      />
    </div>
  );
}
