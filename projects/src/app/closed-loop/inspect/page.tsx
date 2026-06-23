'use client';

import { useState, useEffect } from 'react';
import {
  PageHeader,
  ProblemTypeBadge,
  TaskDispatchDialog,
  FieldInspectionDialog,
  SpotDetailDialog,
} from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { inspectionTasks as mockTasks, spots as mockSpots } from '@/lib/data/mock-data';
import { useCityFilter, filterByCityWithCity } from '@/lib/data/filter';
import { useAuth } from '@/lib/auth';
import { getStorageData, setStorageData } from '@/lib/storage';
import { toast } from 'sonner';
import { Bell, Eye, UserPlus, ClipboardCheck, AlertTriangle, Download } from 'lucide-react';
import type { InspectionTask, Spot } from '@/types';

const STORAGE_KEY = 'closed-loop-inspect-data';

export default function InspectManagePage() {
  const userCity = useCityFilter();
  const [taskList, setTaskList] = useState<InspectionTask[]>([]);
  const [spotList, setSpotList] = useState<Spot[]>([]);
  const [showDispatchDialog, setShowDispatchDialog] = useState(false);
  const [showInspectDialog, setShowInspectDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // 初始化数据
  useEffect(() => {
    const storedTasks = getStorageData<InspectionTask[]>(STORAGE_KEY + '-tasks', []);
    const storedSpots = getStorageData<Spot[]>(STORAGE_KEY + '-spots', []);
    if (storedTasks.length > 0) {
      setTaskList(storedTasks);
    } else {
      setTaskList(filterByCityWithCity(mockTasks, userCity));
      setStorageData(STORAGE_KEY + '-tasks', filterByCityWithCity(mockTasks, userCity));
    }
    if (storedSpots.length > 0) {
      setSpotList(storedSpots);
    } else {
      setSpotList(filterByCityWithCity(mockSpots, userCity));
      setStorageData(STORAGE_KEY + '-spots', filterByCityWithCity(mockSpots, userCity));
    }
  }, []);

  const pendingTasks = taskList.filter(t => t.status === '待核查');
  const inProgressTasks = taskList.filter(t => t.status === '核查中');
  const completedTasks = taskList.filter(t => t.status === '已完成');
  const overdueTasks = taskList.filter(t => t.overdue);

  const handleDispatch = (task: InspectionTask) => {
    setSelectedTask(task);
    setShowDispatchDialog(true);
  };

  const handleInspect = (task: InspectionTask) => {
    setSelectedTask(task);
    const spot = spotList.find(s => s.spotNo === task.spotNo);
    if (spot) {
      setSelectedSpot(spot);
    } else {
      // 如果没有找到对应图斑，创建一个临时图斑
      setSelectedSpot({
        id: task.id,
        spotNo: task.spotNo || '',
        problemType: task.type,
        area: task.area,
        riskLevel: 'medium',
        location: task.location,
        city: '',
        county: '',
        town: '',
        status: '核查中',
        discoverDate: task.assignTime,
        batchNo: '',
        coordinate: { lng: 117.2272, lat: 31.8206 },
      });
    }
    setShowInspectDialog(true);
  };

  const handleViewDetail = (task: InspectionTask) => {
    setSelectedTask(task);
    const spot = spotList.find(s => s.spotNo === task.spotNo);
    if (spot) {
      setSelectedSpot(spot);
    }
    setShowDetailDialog(true);
  };

  // 分配确认
  const handleDispatchConfirm = (data: { inspector: string; deadline: string; remark: string }) => {
    if (!selectedTask) return;

    const updatedList = taskList.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          status: '核查中' as const,
          inspector: data.inspector,
          deadline: data.deadline,
        };
      }
      return t;
    });

    setTaskList(updatedList);
    setStorageData(STORAGE_KEY + '-tasks', updatedList);
    setShowDispatchDialog(false);
    toast.success('任务分配成功', {
      description: `${selectedTask.taskNo} 已分配给${data.inspector}，截止${data.deadline}`,
    });
  };

  // 核查上报
  const handleInspectSubmit = (data: {
    result: 'confirmed' | 'false_alarm' | 'pending_review';
    problemType: string;
    area: number;
    description: string;
    photos: string[];
    location: string;
  }) => {
    if (!selectedTask) return;

    const resultText = data.result === 'confirmed' ? '问题属实' : data.result === 'false_alarm' ? '问题不属实' : '需上级复核';
    const updatedList = taskList.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          status: '已完成' as const,
          result: resultText as '问题属实' | '问题不属实',
        };
      }
      return t;
    });

    setTaskList(updatedList);
    setStorageData(STORAGE_KEY + '-tasks', updatedList);
    setShowInspectDialog(false);
    toast.success('核查上报成功', {
      description: `${selectedTask.taskNo} 核查结果：${resultText}`,
    });
  };

  // 催办
  const handleUrge = (task?: InspectionTask) => {
    if (task) {
      toast.success('催办通知已发送', { description: `已向 ${task.inspector || '核查人员'} 发送催办通知` });
    } else {
      toast.success('催办通知已批量发送', { description: `已向所有超期任务核查人员发送催办通知` });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="核查管理"
        description="管理所有核查任务，跟踪核查进度，处理超时预警"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button variant="outline" onClick={() => handleUrge()}>
              <Bell className="mr-2 h-4 w-4" />
              催办
            </Button>
          </div>
        }
      />

      {/* 状态统计 */}
      <div className="flex gap-4">
        <Badge variant="outline" className="px-4 py-2 text-sm">
          待核查 <span className="ml-1 font-bold text-warning">{pendingTasks.length}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-2 text-sm">
          核查中 <span className="ml-1 font-bold text-primary">{inProgressTasks.length}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-2 text-sm">
          已完成 <span className="ml-1 font-bold text-success">{completedTasks.length}</span>
        </Badge>
      </div>

      {/* 超期预警 */}
      {overdueTasks.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-5 w-5" />
              超期预警 ({overdueTasks.length}条)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4"
              >
                <div className="flex items-center gap-4">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <span className="font-medium">{task.spotNo || task.eventNo}</span>
                    <span className="ml-2 text-muted-foreground">{task.type}</span>
                    <span className="ml-2 text-destructive">
                      超期{task.overdueDays}天
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleUrge(task)}>
                    <Bell className="mr-2 h-4 w-4" />
                    催办
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetail(task)}>
                    <Eye className="mr-2 h-4 w-4" />
                    查看
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 任务列表 */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">待核查 ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="progress">核查中 ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">已完成 ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              {pendingTasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务编号</TableHead>
                      <TableHead>图斑/事件编号</TableHead>
                      <TableHead>问题类型</TableHead>
                      <TableHead>行政区划</TableHead>
                      <TableHead>接收时间</TableHead>
                      <TableHead>剩余时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.taskNo}</TableCell>
                        <TableCell>{task.spotNo || task.eventNo}</TableCell>
                        <TableCell>
                          <ProblemTypeBadge type={task.type} />
                        </TableCell>
                        <TableCell>{task.location}</TableCell>
                        <TableCell>{task.assignTime}</TableCell>
                        <TableCell>
                          <span className="text-success">剩余5天</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDispatch(task)}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              分配
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(task)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              查看
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Eye className="mb-2 h-10 w-10" />
                  <p>暂无待核查任务</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardContent className="pt-6">
              {inProgressTasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务编号</TableHead>
                      <TableHead>图斑/事件编号</TableHead>
                      <TableHead>问题类型</TableHead>
                      <TableHead>行政区划</TableHead>
                      <TableHead>核查人</TableHead>
                      <TableHead>剩余时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inProgressTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.taskNo}</TableCell>
                        <TableCell>{task.spotNo || task.eventNo}</TableCell>
                        <TableCell>
                          <ProblemTypeBadge type={task.type} />
                        </TableCell>
                        <TableCell>{task.location}</TableCell>
                        <TableCell>{task.inspector || '--'}</TableCell>
                        <TableCell>
                          <span className="text-success">剩余3天</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleInspect(task)}
                            >
                              <ClipboardCheck className="mr-2 h-4 w-4" />
                              核查上报
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(task)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              查看
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ClipboardCheck className="mb-2 h-10 w-10" />
                  <p>暂无核查中任务</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="pt-6">
              {completedTasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务编号</TableHead>
                      <TableHead>图斑/事件编号</TableHead>
                      <TableHead>问题类型</TableHead>
                      <TableHead>行政区划</TableHead>
                      <TableHead>核查人</TableHead>
                      <TableHead>核查结果</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.taskNo}</TableCell>
                        <TableCell>{task.spotNo || task.eventNo}</TableCell>
                        <TableCell>
                          <ProblemTypeBadge type={task.type} />
                        </TableCell>
                        <TableCell>{task.location}</TableCell>
                        <TableCell>{task.inspector}</TableCell>
                        <TableCell>
                          <Badge variant={task.result === '问题属实' ? 'destructive' : 'default'}>
                            {task.result || '已完成'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(task)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Eye className="mb-2 h-10 w-10" />
                  <p>暂无已完成任务</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 任务分配弹窗 */}
      <TaskDispatchDialog
        open={showDispatchDialog}
        onOpenChange={setShowDispatchDialog}
        task={selectedTask}
        onConfirm={handleDispatchConfirm}
      />

      {/* 现场核查弹窗 */}
      <FieldInspectionDialog
        open={showInspectDialog}
        onOpenChange={setShowInspectDialog}
        spot={selectedSpot}
        onSubmit={handleInspectSubmit}
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
