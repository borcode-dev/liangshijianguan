'use client';

import { useState, useEffect } from 'react';
import { PageHeader, StatusBadge, ProblemTypeBadge, RiskBadge } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { inspectionTasks as mockTasks } from '@/lib/data/mock-data';
import { getStorageData, setStorageData } from '@/lib/storage';
import { toast } from 'sonner';
import { Eye, Navigation, Clock, AlertTriangle, MapPin, Camera, CheckCircle2 } from 'lucide-react';
import type { InspectionTask } from '@/types';

const STORAGE_KEY = 'events-inspect-data';

export default function EventInspectPage() {
  const [taskList, setTaskList] = useState<InspectionTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);

  // 核查表单状态
  const [inspectMethod, setInspectMethod] = useState('onsite');
  const [inspectResult, setInspectResult] = useState<'问题属实' | '问题不属实'>('问题属实');
  const [inspectDescription, setInspectDescription] = useState('');
  const [inspectPerson, setInspectPerson] = useState('');
  const [inspectTime, setInspectTime] = useState('');

  // 初始化数据
  useEffect(() => {
    const stored = getStorageData<InspectionTask[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      setTaskList(stored);
    } else {
      setTaskList(mockTasks);
      setStorageData(STORAGE_KEY, mockTasks);
    }
  }, []);

  // 统计
  const pendingTasks = taskList.filter(t => t.status === '待核查');
  const inProgressTasks = taskList.filter(t => t.status === '核查中');
  const completedTasks = taskList.filter(t => t.status === '已完成');
  const overdueTasks = taskList.filter(t => t.overdue);

  // 过滤
  const filteredTasks = statusFilter === 'all'
    ? taskList
    : taskList.filter(t => {
        if (statusFilter === 'overdue') return t.overdue;
        return t.status === statusFilter;
      });

  // 打开核查弹窗
  const handleInspect = (task: InspectionTask) => {
    setSelectedTask(task);
    setInspectMethod('onsite');
    setInspectResult('问题属实');
    setInspectDescription('');
    setInspectPerson(task.inspector || '');
    setInspectTime(new Date().toISOString().slice(0, 16));
    setIsInspectOpen(true);
  };

  // 提交核查
  const handleSubmitInspect = () => {
    if (!inspectDescription) {
      toast.error('请填写核查说明');
      return;
    }
    if (!inspectPerson) {
      toast.error('请填写核查人');
      return;
    }

    const updatedList = taskList.map(t => {
      if (t.id === selectedTask?.id) {
        return {
          ...t,
          status: '已完成' as const,
          result: inspectResult,
          inspector: inspectPerson,
        };
      }
      return t;
    });

    setTaskList(updatedList);
    setStorageData(STORAGE_KEY, updatedList);
    setIsInspectOpen(false);
    toast.success('核查提交成功', { description: `${selectedTask?.taskNo} 核查结果：${inspectResult}` });
  };

  // 查看详情
  const handleViewDetail = (task: InspectionTask) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  // 点击状态卡片过滤
  const handleCardClick = (filter: string) => {
    setStatusFilter(filter);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="事件核查"
        description="县级核查人员接收核查任务，到达现场进行实地核查，填写核查结论"
      />

      {/* 状态统计 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary" onClick={() => handleCardClick('待核查')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待核查任务</p>
                <p className="text-2xl font-bold text-warning">{pendingTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary" onClick={() => handleCardClick('核查中')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">核查中</p>
                <p className="text-2xl font-bold text-info">{inProgressTasks.length}</p>
              </div>
              <Eye className="h-8 w-8 text-info/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary" onClick={() => handleCardClick('已完成')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已完成</p>
                <p className="text-2xl font-bold text-success">{completedTasks.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary border-destructive/50 bg-destructive/5" onClick={() => handleCardClick('overdue')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">超期任务</p>
                <p className="text-2xl font-bold text-destructive">{overdueTasks.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 当前过滤提示 */}
      {statusFilter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">当前筛选：</span>
          <Badge variant="outline">
            {statusFilter === 'overdue' ? '超期任务' : statusFilter}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')}>
            清除筛选
          </Button>
        </div>
      )}

      {/* 待核查任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">核查任务列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredTasks.length > 0 ? filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-lg border p-4 ${task.overdue ? 'border-destructive bg-destructive/5' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {task.overdue && (
                      <Badge variant="destructive" className="text-xs">
                        紧急
                      </Badge>
                    )}
                    <span className="font-medium">
                      {task.eventNo || task.spotNo}
                    </span>
                    <ProblemTypeBadge type={task.type} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>地点：{task.location}</span>
                    <span>面积：{task.area}亩</span>
                    <span className={task.overdue ? 'text-destructive font-medium' : ''}>
                      {task.overdue ? `超期${task.overdueDays}天` : `截止：${task.deadline}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {task.status}
                    </Badge>
                    {task.inspector && (
                      <span className="text-xs text-muted-foreground">核查人：{task.inspector}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetail(task)}>
                    <Eye className="mr-2 h-4 w-4" />
                    查看详情
                  </Button>
                  {(task.status === '待核查' || task.status === '核查中') && (
                    <Button size="sm" onClick={() => handleInspect(task)}>立即核查</Button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="mb-2 h-10 w-10" />
              <p>暂无任务</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 核查弹窗 */}
      <Dialog open={isInspectOpen} onOpenChange={setIsInspectOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>现场核查</DialogTitle>
            <DialogDescription>填写现场核查结果并提交</DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6">
              {/* 事件信息 */}
              <div className="rounded-lg bg-muted p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-sm text-muted-foreground">任务编号：</span>
                    <span className="font-medium">{selectedTask.taskNo}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">问题类型：</span>
                    <ProblemTypeBadge type={selectedTask.type} />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">地点：</span>
                    <span className="font-medium">{selectedTask.location}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">面积：</span>
                    <span className="font-medium">{selectedTask.area}亩</span>
                  </div>
                </div>
              </div>

              {/* 导航到现场 */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">目标坐标：117.1234°E, 33.4567°N</p>
                      <p className="text-sm text-muted-foreground">
                        距离：12.5公里 | 预计时间：25分钟
                      </p>
                    </div>
                  </div>
                  <Button size="sm">
                    <Navigation className="mr-2 h-4 w-4" />
                    打开导航
                  </Button>
                </div>
              </div>

              {/* 核查信息 */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>核查人 *</Label>
                    <Input
                      placeholder="请输入核查人姓名"
                      value={inspectPerson}
                      onChange={(e) => setInspectPerson(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>核查时间</Label>
                    <Input
                      type="datetime-local"
                      value={inspectTime}
                      onChange={(e) => setInspectTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>核查方式</Label>
                  <RadioGroup value={inspectMethod} onValueChange={setInspectMethod} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="onsite" id="onsite" />
                      <Label htmlFor="onsite" className="cursor-pointer">实地核查</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id="video" />
                      <Label htmlFor="video" className="cursor-pointer">视频核查</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="phone" />
                      <Label htmlFor="phone" className="cursor-pointer">电话核实</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>核查结论 *</Label>
                  <RadioGroup
                    value={inspectResult}
                    onValueChange={(v) => setInspectResult(v as '问题属实' | '问题不属实')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="问题属实" id="confirmed" />
                      <Label htmlFor="confirmed" className="cursor-pointer text-destructive">问题属实</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="问题不属实" id="notconfirmed" />
                      <Label htmlFor="notconfirmed" className="cursor-pointer text-success">问题不属实</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>实际情况 *</Label>
                  <Textarea
                    placeholder="请详细描述核查情况..."
                    rows={4}
                    value={inspectDescription}
                    onChange={(e) => setInspectDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* 现场补充照片 */}
              <div className="space-y-4">
                <h4 className="font-medium">现场补充照片</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary"
                    >
                      <div className="text-center text-muted-foreground">
                        <Camera className="mx-auto h-8 w-8" />
                        <span className="text-sm">上传照片</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInspectOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitInspect}>提交核查</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情弹窗 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>任务详情</DialogTitle>
            <DialogDescription>查看核查任务的详细信息</DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">任务编号</div>
                  <div className="font-medium">{selectedTask.taskNo}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">图斑/事件编号</div>
                  <div className="font-medium">{selectedTask.spotNo || selectedTask.eventNo}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">问题类型</div>
                  <ProblemTypeBadge type={selectedTask.type} />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">状态</div>
                  <Badge variant="outline">{selectedTask.status}</Badge>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">行政区划</div>
                  <div className="font-medium">{selectedTask.location}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">面积</div>
                  <div className="font-medium">{selectedTask.area} 亩</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">接收时间</div>
                  <div className="font-medium">{selectedTask.assignTime}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">截止时间</div>
                  <div className="font-medium">{selectedTask.deadline}</div>
                </div>
              </div>

              {selectedTask.inspector && (
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">核查人</div>
                  <div className="font-medium">{selectedTask.inspector}</div>
                </div>
              )}

              {selectedTask.result && (
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">核查结果</div>
                  <Badge variant={selectedTask.result === '问题属实' ? 'destructive' : 'default'}>
                    {selectedTask.result}
                  </Badge>
                </div>
              )}

              {selectedTask.overdue && (
                <div className="rounded-lg border border-destructive bg-destructive/5 p-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">已超期 {selectedTask.overdueDays} 天</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
