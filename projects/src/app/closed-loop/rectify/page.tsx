'use client';

import { useState, useEffect } from 'react';
import {
  PageHeader,
  ProblemTypeBadge,
  ProgressBar,
  RectificationDialog,
  AcceptanceDialog,
} from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { rectificationTasks as mockTasks, spots as mockSpots } from '@/lib/data/mock-data';
import { useCityFilter, filterByCityWithCity } from '@/lib/data/filter';
import { useAuth } from '@/lib/auth';
import { getStorageData, setStorageData, generateId, generateNo } from '@/lib/storage';
import { toast } from 'sonner';
import { Download, Bell, Eye, Clock, AlertTriangle, CheckCircle2, Plus, CheckCheck } from 'lucide-react';
import type { Spot, RectificationTask, ProblemType } from '@/types';

const STORAGE_KEY = 'closed-loop-rectify-data';

export default function RectifyManagePage() {
  const userCity = useCityFilter();
  const [taskList, setTaskList] = useState<RectificationTask[]>([]);
  const [spotList, setSpotList] = useState<Spot[]>([]);
  const [showRectifyDialog, setShowRectifyDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedTask, setSelectedTask] = useState<{ id: string; spotNo: string; type: string } | null>(null);
  const [selectedProgressTask, setSelectedProgressTask] = useState<RectificationTask | null>(null);

  // 新建整改表单
  const [newEventNo, setNewEventNo] = useState('');
  const [newType, setNewType] = useState<ProblemType>('撂荒');
  const [newLocation, setNewLocation] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newMeasures, setNewMeasures] = useState('');

  // 进度更新
  const [progressValue, setProgressValue] = useState(0);
  const [progressRemark, setProgressRemark] = useState('');

  // 初始化数据
  useEffect(() => {
    const storedTasks = getStorageData<RectificationTask[]>(STORAGE_KEY + '-tasks', []);
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

  const pendingTasks = taskList.filter(t => t.status === '待整改');
  const inProgressTasks = taskList.filter(t => t.status === '整改中');
  const waitingTasks = taskList.filter(t => t.status === '待验收');
  const completedTasks = taskList.filter(t => t.status === '已完成');

  // 打开创建整改弹窗
  const handleCreateRectify = () => {
    const spot = spotList.find(s => s.status === '待上报' || s.status === '待核查');
    if (spot) {
      setSelectedSpot(spot);
    } else {
      setSelectedSpot(null);
    }
    setShowRectifyDialog(true);
  };

  // 为待整改任务创建整改
  const handleCreateRectifyForTask = (task: RectificationTask) => {
    setSelectedSpot({
      id: task.id,
      spotNo: task.eventNo,
      problemType: task.eventType,
      area: 0,
      riskLevel: 'medium',
      location: task.location,
      city: '',
      county: '',
      town: '',
      status: '待上报',
      discoverDate: '',
      batchNo: '',
      coordinate: { lng: 117.2272, lat: 31.8206 },
    });
    setShowRectifyDialog(true);
  };

  // 打开验收弹窗
  const handleAccept = (task: RectificationTask) => {
    setSelectedTask({ id: task.id, spotNo: task.eventNo, type: task.measures[0] });
    setShowAcceptDialog(true);
  };

  // 打开进度更新弹窗
  const handleUpdateProgress = (task: RectificationTask) => {
    setSelectedProgressTask(task);
    setProgressValue(task.progress);
    setProgressRemark('');
    setShowProgressDialog(true);
  };

  // 创建整改任务
  const handleRectifyCreate = (data: { responsible: string; deadline: string; measures: string; target: string }) => {
    const newTask: RectificationTask = {
      id: generateId(),
      eventNo: selectedSpot?.spotNo || generateNo('SJ'),
      eventType: selectedSpot?.problemType || '撂荒',
      location: selectedSpot?.location || '',
      city: selectedSpot?.city || '',
      responsiblePerson: data.responsible,
      responsibleUnit: data.responsible === 'owner' ? '地块经营权人' : data.responsible === 'village' ? '村委会' : '乡镇政府',
      deadline: data.deadline,
      status: '整改中',
      progress: 0,
      measures: data.measures.split('，').filter(Boolean),
    };

    const updatedList = [...taskList, newTask];
    setTaskList(updatedList);
    setStorageData(STORAGE_KEY + '-tasks', updatedList);
    setShowRectifyDialog(false);
    toast.success('整改任务创建成功', { description: `事件编号：${newTask.eventNo}` });
  };

  // 验收确认
  const handleAcceptConfirm = (data: { passed: boolean; score: number; remark: string }) => {
    if (!selectedTask) return;

    const updatedList = taskList.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          status: data.passed ? '已完成' as const : '整改中' as const,
          progress: data.passed ? 100 : t.progress,
        };
      }
      return t;
    });

    setTaskList(updatedList);
    setStorageData(STORAGE_KEY + '-tasks', updatedList);
    setShowAcceptDialog(false);
    toast.success(data.passed ? '验收通过' : '验收未通过', {
      description: data.passed ? `评分：${data.score}分` : '已退回继续整改',
    });
  };

  // 提交进度更新
  const handleSubmitProgress = () => {
    if (!selectedProgressTask) return;

    const updatedList = taskList.map(t => {
      if (t.id === selectedProgressTask.id) {
        const newStatus = progressValue >= 100 ? '待验收' as const : '整改中' as const;
        return { ...t, progress: progressValue, status: newStatus };
      }
      return t;
    });

    setTaskList(updatedList);
    setStorageData(STORAGE_KEY + '-tasks', updatedList);
    setShowProgressDialog(false);
    toast.success('进度已更新', { description: `当前进度：${progressValue}%` });
  };

  // 催办
  const handleUrge = () => {
    toast.success('催办通知已发送', { description: '已向所有整改责任人发送催办通知' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="整改管理"
        description="跟踪整改落实情况，审核整改完成报告"
        actions={
          <div className="flex gap-2">
            <Button onClick={handleCreateRectify}>
              <Plus className="mr-2 h-4 w-4" />
              创建整改任务
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button variant="outline" onClick={handleUrge}>
              <Bell className="mr-2 h-4 w-4" />
              催办
            </Button>
          </div>
        }
      />

      {/* 状态统计 */}
      <div className="flex gap-4">
        <Badge variant="outline" className="px-4 py-2">
          待整改 <span className="ml-1 font-bold">{pendingTasks.length}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-2 border-warning text-warning">
          整改中 <span className="ml-1 font-bold">{inProgressTasks.length}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-2 border-primary text-primary">
          待验收 <span className="ml-1 font-bold">{waitingTasks.length}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-2 border-success text-success">
          已完成 <span className="ml-1 font-bold">{completedTasks.length}</span>
        </Badge>
      </div>

      {/* 任务列表 */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">待整改 ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="progress">整改中 ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="waiting">待验收 ({waitingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">已完成 ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              {pendingTasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>事件编号</TableHead>
                      <TableHead>问题类型</TableHead>
                      <TableHead>面积</TableHead>
                      <TableHead>行政区划</TableHead>
                      <TableHead>核查完成时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.eventNo}</TableCell>
                        <TableCell>
                          <ProblemTypeBadge type={task.eventType} />
                        </TableCell>
                        <TableCell>{task.location}</TableCell>
                        <TableCell>{task.deadline}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCreateRectifyForTask(task)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            创建整改
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Plus className="mb-2 h-8 w-8" />
                  <p>暂无待整改任务</p>
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
                      <TableHead>事件编号</TableHead>
                      <TableHead>整改内容</TableHead>
                      <TableHead>责任人</TableHead>
                      <TableHead>整改时限</TableHead>
                      <TableHead>完成进度</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inProgressTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.eventNo}</TableCell>
                        <TableCell>{task.measures[0]}</TableCell>
                        <TableCell>{task.responsiblePerson}</TableCell>
                        <TableCell>{task.deadline}</TableCell>
                        <TableCell>
                          <ProgressBar value={task.progress} showLabel />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateProgress(task)}
                            >
                              更新进度
                            </Button>
                            <Button variant="ghost" size="sm">
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
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Clock className="mb-2 h-8 w-8" />
                  <p>暂无整改中任务</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waiting">
          <Card>
            <CardContent className="pt-6">
              {waitingTasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>事件编号</TableHead>
                      <TableHead>整改内容</TableHead>
                      <TableHead>责任人</TableHead>
                      <TableHead>整改完成时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitingTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.eventNo}</TableCell>
                        <TableCell>{task.measures[0]}</TableCell>
                        <TableCell>{task.responsiblePerson}</TableCell>
                        <TableCell>{task.deadline}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAccept(task)}
                          >
                            <CheckCheck className="mr-2 h-4 w-4" />
                            验收
                          </Button>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <Eye className="mr-2 h-4 w-4" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCheck className="mb-2 h-8 w-8" />
                  <p>暂无待验收任务</p>
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
                      <TableHead>事件编号</TableHead>
                      <TableHead>整改内容</TableHead>
                      <TableHead>责任人</TableHead>
                      <TableHead>验收时间</TableHead>
                      <TableHead>验收结果</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.eventNo}</TableCell>
                        <TableCell>{task.measures[0]}</TableCell>
                        <TableCell>{task.responsiblePerson}</TableCell>
                        <TableCell>{task.deadline}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-success border-success">
                            通过
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle2 className="mb-2 h-8 w-8" />
                  <p>暂无已完成任务</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 创建整改任务弹窗 */}
      <RectificationDialog
        open={showRectifyDialog}
        onOpenChange={setShowRectifyDialog}
        spot={selectedSpot}
        onCreate={handleRectifyCreate}
      />

      {/* 验收弹窗 */}
      <AcceptanceDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        task={selectedTask}
        onAccept={handleAcceptConfirm}
      />

      {/* 进度更新弹窗 */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>更新整改进度</DialogTitle>
            <DialogDescription>更新当前整改任务的完成进度</DialogDescription>
          </DialogHeader>

          {selectedProgressTask && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedProgressTask.eventNo}</span>
                  <ProblemTypeBadge type={selectedProgressTask.eventType} />
                </div>
                <div className="mt-1 text-muted-foreground">{selectedProgressTask.location}</div>
              </div>

              <div className="space-y-2">
                <Label>当前进度</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    value={progressValue}
                    onChange={(e) => setProgressValue(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">{progressValue}%</span>
                </div>
                <ProgressBar value={progressValue} showLabel />
              </div>

              <div className="space-y-2">
                <Label>进度说明</Label>
                <Textarea
                  placeholder="请输入进度更新说明..."
                  value={progressRemark}
                  onChange={(e) => setProgressRemark(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProgressDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitProgress}>确认更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
