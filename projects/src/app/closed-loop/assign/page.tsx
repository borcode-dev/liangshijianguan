'use client';

import { useState, useEffect } from 'react';
import {
  PageHeader,
  RiskBadge,
  ProblemTypeBadge,
  TaskAssignDialog,
  SpotDetailDialog,
} from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { spots as mockSpots } from '@/lib/data/mock-data';
import { useCityFilter, filterByCityWithCity } from '@/lib/data/filter';
import { useAuth } from '@/lib/auth';
import { getStorageData, setStorageData } from '@/lib/storage';
import { toast } from 'sonner';
import { Send, Eye } from 'lucide-react';
import type { Spot } from '@/types';

const STORAGE_KEY = 'closed-loop-assign-data';

export default function TaskAssignPage() {
  const userCity = useCityFilter();
  const [spotList, setSpotList] = useState<Spot[]>([]);
  const [selectedSpotIds, setSelectedSpotIds] = useState<string[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // 初始化数据
  useEffect(() => {
    const stored = getStorageData<Spot[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      setSpotList(stored);
    } else {
      setSpotList(filterByCityWithCity(mockSpots, userCity));
      setStorageData(STORAGE_KEY, filterByCityWithCity(mockSpots, userCity));
    }
  }, []);

  const pendingSpots = spotList.filter(s => s.status === '待下发');

  const toggleSpot = (id: string) => {
    setSelectedSpotIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedSpotIds.length === pendingSpots.length && pendingSpots.length > 0) {
      setSelectedSpotIds([]);
    } else {
      setSelectedSpotIds(pendingSpots.map(s => s.id));
    }
  };

  const getRiskIcon = (level: string) => {
    if (level === 'high') return '🔴';
    if (level === 'medium') return '🟡';
    return '🟢';
  };

  const handleViewSpot = (spot: Spot) => {
    setSelectedSpot(spot);
    setShowDetailDialog(true);
  };

  const handleAssign = (data: { unit: string; deadline: number; remark: string }) => {
    // 更新选中图斑的状态为"待核查"
    const updatedList = spotList.map(s => {
      if (selectedSpotIds.includes(s.id)) {
        return {
          ...s,
          status: '待核查' as const,
          deadline: new Date(Date.now() + data.deadline * 86400000).toISOString().slice(0, 10),
          inspector: data.unit,
        };
      }
      return s;
    });

    setSpotList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    setSelectedSpotIds([]);
    setShowAssignDialog(false);
    toast.success('任务下发成功', {
      description: `已下发 ${selectedSpotIds.length} 个图斑到${data.unit}，核查时限${data.deadline}天`,
    });
  };

  const selectedSpots = pendingSpots.filter(s => selectedSpotIds.includes(s.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="任务下发"
        description="省级/市级将监测发现的疑似图斑下发到县级进行核查处置"
        actions={
          <Button
            onClick={() => {
              if (selectedSpotIds.length === 0) {
                toast.error('请先选择要下发的图斑');
                return;
              }
              setShowAssignDialog(true);
            }}
            disabled={selectedSpotIds.length === 0}
          >
            <Send className="mr-2 h-4 w-4" />
            批量下发 ({selectedSpotIds.length})
          </Button>
        }
      />

      {/* 待下发图斑 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              待下发图斑 ({pendingSpots.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                id="selectAll"
                checked={selectedSpotIds.length === pendingSpots.length && pendingSpots.length > 0}
                onCheckedChange={toggleAll}
              />
              <Label htmlFor="selectAll" className="text-sm cursor-pointer">
                全选
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingSpots.length > 0 ? pendingSpots.map((spot) => (
            <div
              key={spot.id}
              className={`flex items-center gap-4 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                selectedSpotIds.includes(spot.id) ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => toggleSpot(spot.id)}
            >
              <Checkbox
                checked={selectedSpotIds.includes(spot.id)}
                onCheckedChange={() => toggleSpot(spot.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{spot.spotNo}</span>
                  <ProblemTypeBadge type={spot.problemType} />
                  <span className="text-sm">{spot.area}亩</span>
                  <div className="flex items-center gap-1">
                    <span>{getRiskIcon(spot.riskLevel)}</span>
                    <RiskBadge level={spot.riskLevel} />
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground truncate">
                  {spot.location} | {spot.discoverDate}监测
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewSpot(spot);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                查看
              </Button>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Send className="mb-2 h-10 w-10" />
              <p>暂无待下发图斑</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 任务下发弹窗 */}
      <TaskAssignDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        spots={selectedSpots}
        onConfirm={handleAssign}
      />

      {/* 图斑详情弹窗 */}
      <SpotDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        spot={selectedSpot}
      />
    </div>
  );
}
